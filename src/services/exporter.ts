import Papa from 'papaparse';
import { ParquetDataFile } from '../types/parquet';

export type ExportFormat = 'csv' | 'json' | 'ndjson' | 'tsv';

export function exportDataToString(
  rows: Record<string, any>[],
  columns: string[],
  format: ExportFormat
): string {
  // Strip internal _rowIndex
  const cleanRows = rows.map((r) => {
    const obj: Record<string, any> = {};
    for (const col of columns) {
      const val = r[col];
      if (val instanceof Date) {
        obj[col] = val.toISOString();
      } else if (format === 'csv' || format === 'tsv') {
        if (typeof val === 'object' && val !== null) {
          obj[col] = JSON.stringify(val);
        } else {
          obj[col] = val;
        }
      } else {
        // For JSON and NDJSON, preserve native objects, arrays, primitives
        obj[col] = val;
      }
    }
    return obj;
  });

  switch (format) {
    case 'csv':
      return Papa.unparse(cleanRows, { quotes: true, header: true });

    case 'tsv':
      return Papa.unparse(cleanRows, { delimiter: '\t', quotes: false, header: true });

    case 'ndjson':
      return cleanRows.map((r) => JSON.stringify(r)).join('\n');

    case 'json':
    default:
      return JSON.stringify(cleanRows, null, 2);
  }
}

export function generateCodeSnippets(file: ParquetDataFile): Record<string, string> {
  const filePath = file.path || file.name;

  return {
    python_pandas: `# Load Parquet in Python with Pandas
import pandas as pd

# Read parquet file
df = pd.read_parquet('${filePath}')

print(f"Loaded {len(df)} rows and {len(df.columns)} columns")
print(df.head())
print(df.info())
`,
    python_polars: `# Load Parquet in Python with Polars (Blazing Fast)
import polars as pl

# Read parquet file
df = pl.read_parquet('${filePath}')

print(df.head())
print(df.schema)
`,
    python_duckdb: `# Query Parquet file directly in DuckDB
import duckdb

# Connect to in-memory DuckDB
con = duckdb.connect()

# Query directly without importing
result = con.execute("""
    SELECT * 
    FROM read_parquet('${filePath}')
    LIMIT 10
""").df()

print(result)
`,
    python_pyarrow: `# Read Parquet with Apache PyArrow
import pyarrow.parquet as pq

# Read parquet metadata and table
table = pq.read_table('${filePath}')
metadata = pq.read_metadata('${filePath}')

print(f"Num rows: {table.num_rows}, Num columns: {table.num_columns}")
print(f"Row groups: {metadata.num_row_groups}")
print(table.schema)
`,
    nodejs_duckdb: `// Read Parquet in Node.js with DuckDB
import duckdb from 'duckdb';

const db = new duckdb.Database(':memory:');
db.all("SELECT * FROM read_parquet('${filePath}') LIMIT 10", (err, rows) => {
  if (err) throw err;
  console.log(rows);
});
`,
    sql_cli: `-- DuckDB CLI command
duckdb -c "SELECT * FROM '${filePath}' LIMIT 20;"
`,
  };
}
