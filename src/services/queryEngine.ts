import { ColumnStats, ParquetDataFile, ParquetDataType } from '../types/parquet';

export interface QueryResult {
  columns: string[];
  columnTypes: Record<string, ParquetDataType>;
  rows: Record<string, any>[];
  executionTimeMs: number;
  totalCount: number;
}

/**
 * High-performance SQL query processor for local Parquet datasets
 */
export function executeParquetQuery(file: ParquetDataFile, queryStr: string): QueryResult {
  const startTime = performance.now();
  const trimmed = queryStr.trim().replace(/;+$/, '');

  if (!trimmed) {
    return {
      columns: file.columns,
      columnTypes: file.columnTypes,
      rows: file.rows,
      executionTimeMs: 0,
      totalCount: file.rows.length,
    };
  }

  try {
    // Parse basic SQL: SELECT ... FROM ... [WHERE ...] [GROUP BY ...] [ORDER BY ...] [LIMIT ...]
    const selectMatch = trimmed.match(/SELECT\s+(.+?)\s+FROM/i);
    const whereMatch = trimmed.match(/WHERE\s+(.+?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/i);
    const groupByMatch = trimmed.match(/GROUP\s+BY\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
    const orderByMatch = trimmed.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/i);
    const limitMatch = trimmed.match(/LIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?$/i);

    let rows = [...file.rows];

    // 1. WHERE filtering
    if (whereMatch && whereMatch[1]) {
      const whereClause = whereMatch[1].trim();
      rows = rows.filter((row) => evaluateWhereClause(row, whereClause));
    }

    // 2. GROUP BY & Aggregation
    if (groupByMatch && groupByMatch[1]) {
      const groupCols = groupByMatch[1].split(',').map((s) => s.trim().replace(/^[`"']|[`"']$/g, ''));
      const selectColsRaw = selectMatch ? selectMatch[1].trim() : '*';

      const aggregatedResult = executeAggregation(rows, groupCols, selectColsRaw);
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

      // Handle ORDER BY on aggregated results
      if (orderByMatch && orderByMatch[1]) {
        applyOrderBy(aggregatedResult.rows, orderByMatch[1]);
      }

      // Handle LIMIT
      let finalRows = aggregatedResult.rows;
      if (limitMatch) {
        const limit = parseInt(limitMatch[1], 10);
        const offset = limitMatch[2] ? parseInt(limitMatch[2], 10) : 0;
        finalRows = finalRows.slice(offset, offset + limit);
      }

      return {
        columns: aggregatedResult.columns,
        columnTypes: aggregatedResult.columnTypes,
        rows: finalRows,
        executionTimeMs,
        totalCount: aggregatedResult.rows.length,
      };
    }

    // 3. Simple Aggregations without GROUP BY (e.g. SELECT count(*), avg(price) FROM parquet)
    if (selectMatch && hasAggregateFunctions(selectMatch[1])) {
      const selectColsRaw = selectMatch[1].trim();
      const aggregatedResult = executeAggregation(rows, [], selectColsRaw);
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
      return {
        columns: aggregatedResult.columns,
        columnTypes: aggregatedResult.columnTypes,
        rows: aggregatedResult.rows,
        executionTimeMs,
        totalCount: aggregatedResult.rows.length,
      };
    }

    // 4. Standard Projection (SELECT col1, col2, ...)
    let projectedColumns = file.columns;
    const projectedTypes: Record<string, ParquetDataType> = {};

    if (selectMatch && selectMatch[1] && selectMatch[1].trim() !== '*') {
      const colDefs = selectMatch[1].split(',').map((c) => c.trim());
      projectedColumns = colDefs.map((c) => {
        const asMatch = c.match(/(.+?)\s+AS\s+(.+)/i);
        return asMatch ? asMatch[2].trim().replace(/^[`"']|[`"']$/g, '') : c.replace(/^[`"']|[`"']$/g, '');
      });

      rows = rows.map((r, idx) => {
        const newRow: Record<string, any> = { _rowIndex: idx };
        colDefs.forEach((c) => {
          const asMatch = c.match(/(.+?)\s+AS\s+(.+)/i);
          const origCol = asMatch ? asMatch[1].trim().replace(/^[`"']|[`"']$/g, '') : c.replace(/^[`"']|[`"']$/g, '');
          const alias = asMatch ? asMatch[2].trim().replace(/^[`"']|[`"']$/g, '') : origCol;
          newRow[alias] = r[origCol];
          projectedTypes[alias] = file.columnTypes[origCol] || 'string';
        });
        return newRow;
      });
    } else {
      for (const col of projectedColumns) {
        projectedTypes[col] = file.columnTypes[col] || 'unknown';
      }
    }

    // 5. ORDER BY
    if (orderByMatch && orderByMatch[1]) {
      applyOrderBy(rows, orderByMatch[1]);
    }

    // 6. LIMIT
    let finalRows = rows;
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      const offset = limitMatch[2] ? parseInt(limitMatch[2], 10) : 0;
      finalRows = finalRows.slice(offset, offset + limit);
    }

    const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

    return {
      columns: projectedColumns,
      columnTypes: projectedTypes,
      rows: finalRows,
      executionTimeMs,
      totalCount: rows.length,
    };
  } catch (err: any) {
    console.error('Query execution error:', err);
    throw new Error(`SQL Query error: ${err.message}`);
  }
}

function hasAggregateFunctions(selectStr: string): boolean {
  return /\b(COUNT|SUM|AVG|MIN|MAX)\b\s*\(/i.test(selectStr);
}

function evaluateWhereClause(row: Record<string, any>, whereStr: string): boolean {
  // Support AND / OR conditions
  // Simple token parser
  try {
    const jsCondition = whereStr
      .replace(/AND/gi, '&&')
      .replace(/OR/gi, '||')
      .replace(/NOT/gi, '!')
      .replace(/IS\s+NULL/gi, '=== null')
      .replace(/IS\s+NOT\s+NULL/gi, '!== null')
      .replace(/LIKE\s+'%([^%]+)%'(\s*)/gi, '.includes("$1")')
      .replace(/LIKE\s+'([^%]+)%'(\s*)/gi, '.startsWith("$1")')
      .replace(/LIKE\s+'%([^%]+)'(\s*)/gi, '.endsWith("$1")')
      .replace(/=\s*(['"])/g, '=== $1')
      .replace(/=\s*(\d+)/g, '=== $1')
      .replace(/<>/g, '!==')
      .replace(/!=/g, '!==');

    // Replace column names with row['col']
    let expr = jsCondition;
    for (const key of Object.keys(row)) {
      if (key === '_rowIndex') continue;
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      expr = expr.replace(regex, `(row['${key}'])`);
    }

    // Safe evaluator function
    const fn = new Function('row', `
      try {
        return Boolean(${expr});
      } catch (e) {
        return false;
      }
    `);

    return fn(row);
  } catch {
    return true;
  }
}

function executeAggregation(
  rows: Record<string, any>[],
  groupCols: string[],
  selectStr: string
): { columns: string[]; columnTypes: Record<string, ParquetDataType>; rows: Record<string, any>[] } {
  // Parse select items
  const items = selectStr.split(',').map((s) => s.trim());
  const selectSpecs = items.map((item) => {
    const asMatch = item.match(/(.+?)\s+AS\s+(.+)/i);
    const expr = asMatch ? asMatch[1].trim() : item;
    const alias = asMatch ? asMatch[2].trim().replace(/^[`"']|[`"']$/g, '') : item;

    const fnMatch = expr.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\((.*?)\)$/i);
    if (fnMatch) {
      return {
        isAgg: true,
        fn: fnMatch[1].toUpperCase(),
        arg: fnMatch[2].trim().replace(/^[`"']|[`"']$/g, ''),
        alias,
      };
    }
    return {
      isAgg: false,
      col: expr.replace(/^[`"']|[`"']$/g, ''),
      alias,
    };
  });

  const groups = new Map<string, { keyValues: Record<string, any>; items: Record<string, any>[] }>();

  if (groupCols.length === 0) {
    groups.set('__all__', { keyValues: {}, items: rows });
  } else {
    for (const row of rows) {
      const key = groupCols.map((c) => String(row[c])).join('|||');
      if (!groups.has(key)) {
        const keyValues: Record<string, any> = {};
        for (const c of groupCols) {
          keyValues[c] = row[c];
        }
        groups.set(key, { keyValues, items: [] });
      }
      groups.get(key)!.items.push(row);
    }
  }

  const resultRows: Record<string, any>[] = [];
  let rowIdx = 0;

  for (const group of groups.values()) {
    const outRow: Record<string, any> = { _rowIndex: rowIdx++ };

    for (const spec of selectSpecs) {
      if (spec.isAgg) {
        const { fn, arg, alias } = spec;
        if (fn === 'COUNT') {
          if (arg === '*' || arg === '1') {
            outRow[alias] = group.items.length;
          } else {
            outRow[alias] = group.items.filter((r) => r[arg] !== null && r[arg] !== undefined).length;
          }
        } else if (fn === 'SUM') {
          const sum = group.items.reduce((acc, r) => {
            const v = Number(r[arg]);
            return isNaN(v) ? acc : acc + v;
          }, 0);
          outRow[alias] = parseFloat(sum.toFixed(2));
        } else if (fn === 'AVG') {
          const vals = group.items.map((r) => Number(r[arg])).filter((v) => !isNaN(v));
          const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
          outRow[alias] = avg !== null ? parseFloat(avg.toFixed(2)) : null;
        } else if (fn === 'MIN') {
          const vals = group.items.map((r) => r[arg]).filter((v) => v !== null && v !== undefined);
          outRow[alias] = vals.length > 0 ? vals.reduce((min, cur) => (cur < min ? cur : min)) : null;
        } else if (fn === 'MAX') {
          const vals = group.items.map((r) => r[arg]).filter((v) => v !== null && v !== undefined);
          outRow[alias] = vals.length > 0 ? vals.reduce((max, cur) => (cur > max ? cur : max)) : null;
        }
      } else {
        outRow[spec.alias] = group.keyValues[spec.col ?? ''] ?? (group.items[0] ? group.items[0][spec.col ?? ''] : null);
      }
    }
    resultRows.push(outRow);
  }

  const columns = selectSpecs.map((s) => s.alias);
  const columnTypes: Record<string, ParquetDataType> = {};
  for (const spec of selectSpecs) {
    if (spec.isAgg) {
      columnTypes[spec.alias] = spec.fn === 'COUNT' ? 'int64' : 'double';
    } else {
      columnTypes[spec.alias] = 'string';
    }
  }

  return { columns, columnTypes, rows: resultRows };
}

function applyOrderBy(rows: Record<string, any>[], orderStr: string) {
  const parts = orderStr.split(',').map((s) => s.trim());
  const orders = parts.map((p) => {
    const tokens = p.split(/\s+/);
    const col = tokens[0].replace(/^[`"']|[`"']$/g, '');
    const dir = tokens[1] && tokens[1].toUpperCase() === 'DESC' ? -1 : 1;
    return { col, dir };
  });

  rows.sort((a, b) => {
    for (const { col, dir } of orders) {
      const valA = a[col];
      const valB = b[col];

      if (valA === valB) continue;
      if (valA === null || valA === undefined) return 1 * dir;
      if (valB === null || valB === undefined) return -1 * dir;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      if (valA instanceof Date && valB instanceof Date) {
        return (valA.getTime() - valB.getTime()) * dir;
      }
      return String(valA).localeCompare(String(valB)) * dir;
    }
    return 0;
  });
}

/**
 * Calculates in-depth statistical profile for any column
 */
export function computeColumnStats(file: ParquetDataFile, columnName: string): ColumnStats {
  const type = file.columnTypes[columnName] || 'unknown';
  const values = file.rows.map((r) => r[columnName]);
  const totalCount = values.length;

  let nullCount = 0;
  const nonNullValues: any[] = [];
  const valueCounts = new Map<string, number>();

  for (const v of values) {
    if (v === null || v === undefined) {
      nullCount++;
    } else {
      nonNullValues.push(v);
      const strVal = typeof v === 'object' ? JSON.stringify(v) : String(v);
      valueCounts.set(strVal, (valueCounts.get(strVal) || 0) + 1);
    }
  }

  const distinctCount = valueCounts.size;
  const nullPercentage = parseFloat(((nullCount / (totalCount || 1)) * 100).toFixed(2));

  // Top 10 frequent values
  const sortedValueCounts = Array.from(valueCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([val, count]) => ({
      value: val,
      count,
      percentage: parseFloat(((count / (totalCount || 1)) * 100).toFixed(1)),
    }));

  const isNumeric = type === 'int32' || type === 'int64' || type === 'float' || type === 'double' || type === 'decimal';

  if (isNumeric && nonNullValues.length > 0) {
    const numVals = nonNullValues.map((v) => Number(v)).filter((v) => !isNaN(v)).sort((a, b) => a - b);
    
    if (numVals.length > 0) {
      const min = numVals[0];
      const max = numVals[numVals.length - 1];
      const sum = numVals.reduce((a, b) => a + b, 0);
      const mean = parseFloat((sum / numVals.length).toFixed(3));
      
      const mid = Math.floor(numVals.length / 2);
      const median = numVals.length % 2 !== 0 ? numVals[mid] : (numVals[mid - 1] + numVals[mid]) / 2;

      // Standard deviation
      const variance = numVals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / numVals.length;
      const stdDev = parseFloat(Math.sqrt(variance).toFixed(3));

      // Build 8-bucket histogram
      const bucketCount = 8;
      const range = max - min || 1;
      const bucketSize = range / bucketCount;
      const distribution: { bucket: string; count: number }[] = [];

      for (let b = 0; b < bucketCount; b++) {
        const bStart = min + b * bucketSize;
        const bEnd = min + (b + 1) * bucketSize;
        const label = `${bStart.toFixed(1)} - ${bEnd.toFixed(1)}`;
        const count = numVals.filter((v) => (b === bucketCount - 1 ? v >= bStart && v <= bEnd : v >= bStart && v < bEnd)).length;
        distribution.push({ bucket: label, count });
      }

      return {
        column: columnName,
        type,
        count: totalCount,
        nullCount,
        nullPercentage,
        distinctCount,
        min,
        max,
        mean,
        median,
        stdDev,
        topValues: sortedValueCounts,
        distribution,
      };
    }
  }

  return {
    column: columnName,
    type,
    count: totalCount,
    nullCount,
    nullPercentage,
    distinctCount,
    topValues: sortedValueCounts,
  };
}
