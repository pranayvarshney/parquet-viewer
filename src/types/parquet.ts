export type ParquetDataType =
  | 'string'
  | 'int32'
  | 'int64'
  | 'float'
  | 'double'
  | 'boolean'
  | 'timestamp'
  | 'date'
  | 'time'
  | 'decimal'
  | 'uuid'
  | 'json'
  | 'binary'
  | 'list'
  | 'struct'
  | 'map'
  | 'null'
  | 'unknown';

export interface ColumnSchema {
  name: string;
  path: string[];
  type: ParquetDataType;
  physicalType?: string;
  logicalType?: string;
  repetitionType?: 'REQUIRED' | 'OPTIONAL' | 'REPEATED';
  compression?: string;
  encodings?: string[];
  nullCount?: number;
  distinctCount?: number;
  minValue?: any;
  maxValue?: any;
  children?: ColumnSchema[];
}

export interface RowGroupMetadata {
  index: number;
  numRows: number;
  totalByteSize: number;
  totalCompressedSize: number;
  columns: {
    columnName: string;
    compression: string;
    encodings: string[];
    numValues: number;
    totalUncompressedSize: number;
    totalCompressedSize: number;
    nullCount?: number;
    minValue?: any;
    maxValue?: any;
  }[];
}

export interface FileMetadata {
  fileName: string;
  filePath?: string;
  fileSizeBytes: number;
  numRows: number;
  numColumns: number;
  numRowGroups: number;
  createdBy?: string;
  version?: number | string;
  keyValueMetadata?: Record<string, string>;
  columns: ColumnSchema[];
  rowGroups: RowGroupMetadata[];
}

export interface ParquetDataFile {
  id: string;
  name: string;
  path?: string;
  buffer?: ArrayBuffer;
  metadata: FileMetadata;
  columns: string[];
  columnTypes: Record<string, ParquetDataType>;
  rows: Record<string, any>[];
  totalRows: number;
  loadedAt: Date;
}

export interface ColumnFilter {
  column: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'isNull' | 'isNotNull';
  value: string | number | boolean;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface ColumnStats {
  column: string;
  type: ParquetDataType;
  count: number;
  nullCount: number;
  nullPercentage: number;
  distinctCount: number;
  min?: any;
  max?: any;
  mean?: number;
  median?: number;
  stdDev?: number;
  topValues?: { value: string; count: number; percentage: number }[];
  distribution?: { bucket: string; count: number }[];
}
