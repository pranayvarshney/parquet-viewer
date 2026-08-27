import { parquetMetadata, parquetRead, parquetSchema } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import { FileMetadata, ColumnSchema, RowGroupMetadata, ParquetDataFile, ParquetDataType } from '../types/parquet';

// Register standard decompression algorithms (Snappy, ZSTD, Gzip, Brotli, LZ4)
const defaultCompressors = compressors;

/**
 * Maps Parquet physical & logical types to high-level application types
 */
export function mapParquetType(schemaElement: any): ParquetDataType {
  const logicalType = schemaElement.logical_type || schemaElement.logicalType;
  const convertedType = schemaElement.converted_type;
  const physicalType = schemaElement.type;

  if (logicalType) {
    if (typeof logicalType === 'object') {
      if (logicalType.STRING || logicalType.UTF8 || logicalType.type === 'STRING') return 'string';
      if (logicalType.INTEGER) {
        return (logicalType.INTEGER.bitWidth || 32) <= 32 ? 'int32' : 'int64';
      }
      if (logicalType.DECIMAL) return 'decimal';
      if (logicalType.DATE) return 'date';
      if (logicalType.TIME) return 'time';
      if (logicalType.TIMESTAMP) return 'timestamp';
      if (logicalType.JSON) return 'json';
      if (logicalType.UUID) return 'uuid';
      if (logicalType.LIST || logicalType.type === 'LIST') return 'list';
      if (logicalType.MAP || logicalType.type === 'MAP') return 'map';
    } else if (typeof logicalType === 'string') {
      const lower = logicalType.toLowerCase();
      if (lower.includes('string') || lower.includes('utf8')) return 'string';
      if (lower.includes('int')) return lower.includes('64') ? 'int64' : 'int32';
      if (lower.includes('timestamp')) return 'timestamp';
      if (lower.includes('date')) return 'date';
      if (lower.includes('decimal')) return 'decimal';
      if (lower.includes('uuid')) return 'uuid';
      if (lower.includes('json')) return 'json';
      if (lower.includes('list')) return 'list';
      if (lower.includes('map')) return 'map';
    }
  }

  if (convertedType) {
    switch (convertedType) {
      case 'UTF8':
        return 'string';
      case 'INT_8':
      case 'INT_16':
      case 'INT_32':
      case 'UINT_8':
      case 'UINT_16':
      case 'UINT_32':
        return 'int32';
      case 'INT_64':
      case 'UINT_64':
        return 'int64';
      case 'DATE':
        return 'date';
      case 'TIMESTAMP_MILLIS':
      case 'TIMESTAMP_MICROS':
        return 'timestamp';
      case 'DECIMAL':
        return 'decimal';
      case 'JSON':
        return 'json';
      case 'LIST':
        return 'list';
      case 'MAP':
        return 'map';
    }
  }

  switch (physicalType) {
    case 'BOOLEAN':
      return 'boolean';
    case 'INT32':
      return 'int32';
    case 'INT64':
      return 'int64';
    case 'INT96':
      return 'timestamp';
    case 'FLOAT':
      return 'float';
    case 'DOUBLE':
      return 'double';
    case 'BYTE_ARRAY':
      return 'string';
    case 'FIXED_LEN_BYTE_ARRAY':
      return 'binary';
    default:
      return 'unknown';
  }
}

/**
 * Safely format cell values from parquet data (handles BigInt, Uint8Array, Date, Nested Objects)
 */
export function formatRawValue(val: any, type?: ParquetDataType): any {
  if (val === null || val === undefined) return null;

  // Handle Date instances directly to prevent them becoming empty objects {}
  if (val instanceof Date) {
    return val;
  }

  if (typeof val === 'bigint') {
    // Check if within safe integer range
    if (val >= BigInt(Number.MIN_SAFE_INTEGER) && val <= BigInt(Number.MAX_SAFE_INTEGER)) {
      return Number(val);
    }
    return val.toString();
  }

  if (val instanceof Uint8Array || val instanceof ArrayBuffer) {
    try {
      const decoded = new TextDecoder('utf-8', { fatal: true }).decode(val);
      // Check if it's JSON
      if ((decoded.startsWith('{') && decoded.endsWith('}')) || (decoded.startsWith('[') && decoded.endsWith(']'))) {
        try {
          return JSON.parse(decoded);
        } catch {
          return decoded;
        }
      }
      return decoded;
    } catch {
      // Hex representation for binary
      return Array.from(new Uint8Array(val))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  }

  if (type === 'timestamp' && typeof val === 'number') {
    // Parquet timestamps might be in ms, us, or ns
    if (val > 1e16) {
      // Nanoseconds
      return new Date(val / 1e6);
    } else if (val > 1e13) {
      // Microseconds
      return new Date(val / 1e3);
    } else if (val > 1e9) {
      // Milliseconds or seconds
      return new Date(val);
    }
  }

  if (type === 'date' && typeof val === 'number') {
    // Epoch days
    const d = new Date(val * 86400000);
    return d.toISOString().split('T')[0];
  }

  if (Array.isArray(val)) {
    return val.map((v) => formatRawValue(v));
  }

  if (typeof val === 'object') {
    const formattedObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      formattedObj[k] = formatRawValue(v);
    }
    return formattedObj;
  }

  return val;
}

/**
 * Maps a parquetSchema tree node recursively into a ColumnSchema
 */
export function mapSchemaNode(node: any): ColumnSchema {
  const elem = node.element || {};
  const colType = mapParquetType(elem);

  const logicalTypeObj = elem.logical_type || elem.logicalType;
  const logicalTypeStr = logicalTypeObj
    ? typeof logicalTypeObj === 'object'
      ? Object.keys(logicalTypeObj)[0]
      : String(logicalTypeObj)
    : elem.converted_type;

  const children: ColumnSchema[] = (node.children || []).map((child: any) => mapSchemaNode(child));

  return {
    name: elem.name,
    path: node.path || [elem.name],
    type: colType,
    physicalType: elem.type || 'GROUP',
    logicalType: logicalTypeStr,
    repetitionType: elem.repetition_type as any,
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * Extracts metadata, schema tree, and column definitions from Parquet ArrayBuffer
 */
export function extractParquetMetadata(
  buffer: ArrayBuffer,
  fileName: string,
  filePath?: string
): { metadata: FileMetadata; columnTypes: Record<string, ParquetDataType> } {
  const meta = parquetMetadata(buffer);
  const schemaTree = parquetSchema(meta);
  const kvMeta: Record<string, string> = {};

  if (meta.key_value_metadata) {
    for (const item of meta.key_value_metadata) {
      if (item.key) {
        kvMeta[item.key] = item.value || '';
      }
    }
  }

  // Parse schema tree and top-level root columns only
  const columns: ColumnSchema[] = [];
  const columnTypes: Record<string, ParquetDataType> = {};

  for (const child of schemaTree.children || []) {
    const colSchema = mapSchemaNode(child);
    columns.push(colSchema);
    columnTypes[colSchema.name] = colSchema.type;
  }

  // Parse Row Groups metadata
  const rowGroups: RowGroupMetadata[] = (meta.row_groups || []).map((rg: any, rgIdx: number) => {
    return {
      index: rgIdx,
      numRows: Number(rg.num_rows || 0),
      totalByteSize: Number(rg.total_byte_size || 0),
      totalCompressedSize: Number(rg.total_compressed_size || rg.total_byte_size || 0),
      columns: (rg.columns || []).map((colChunk: any) => {
        const chunkMeta = colChunk.meta_data || {};
        return {
          columnName: (chunkMeta.path_in_schema || []).join('.'),
          compression: chunkMeta.codec || 'UNCOMPRESSED',
          encodings: chunkMeta.encodings || [],
          numValues: Number(chunkMeta.num_values || 0),
          totalUncompressedSize: Number(chunkMeta.total_uncompressed_size || 0),
          totalCompressedSize: Number(chunkMeta.total_compressed_size || 0),
          nullCount: chunkMeta.statistics?.null_count !== undefined ? Number(chunkMeta.statistics.null_count) : undefined,
          minValue: chunkMeta.statistics?.min_value,
          maxValue: chunkMeta.statistics?.max_value,
        };
      }),
    };
  });

  const totalNumRows = Number(meta.num_rows || 0);

  const fileMetadata: FileMetadata = {
    fileName,
    filePath,
    fileSizeBytes: buffer.byteLength,
    numRows: totalNumRows,
    numColumns: columns.length,
    numRowGroups: rowGroups.length,
    createdBy: meta.created_by,
    version: meta.version,
    keyValueMetadata: kvMeta,
    columns,
    rowGroups,
  };

  return { metadata: fileMetadata, columnTypes };
}

/**
 * Reads all or sliced data rows from a Parquet ArrayBuffer
 */
export async function readParquetData(
  buffer: ArrayBuffer,
  fileName: string,
  filePath?: string,
  maxRows?: number
): Promise<ParquetDataFile> {
  const { metadata, columnTypes } = extractParquetMetadata(buffer, fileName, filePath);

  const rows: Record<string, any>[] = [];

  // Read data using parquetRead
  await parquetRead({
    file: buffer,
    compressors: defaultCompressors,
    rowFormat: 'object',
    onComplete: (data: any[]) => {
      const limit = maxRows ? Math.min(data.length, maxRows) : data.length;
      for (let i = 0; i < limit; i++) {
        const rawRow = data[i];
        const formattedRow: Record<string, any> = { _rowIndex: i };
        for (const col of metadata.columns) {
          const colName = col.name;
          formattedRow[colName] = formatRawValue(rawRow[colName], columnTypes[colName]);
        }
        rows.push(formattedRow);
      }
    },
  });

  return {
    id: `${fileName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: fileName,
    path: filePath,
    buffer,
    metadata,
    columns: metadata.columns.map((c) => c.name),
    columnTypes,
    rows,
    totalRows: metadata.numRows,
    loadedAt: new Date(),
  };
}
