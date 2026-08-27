import React from 'react';
import { ParquetDataType } from '../../types/parquet';
import { Eye, Maximize2 } from 'lucide-react';

interface CellRendererProps {
  value: any;
  type?: ParquetDataType;
  columnName: string;
  onInspectNested?: (data: any, title: string) => void;
}

export const CellRenderer: React.FC<CellRendererProps> = ({
  value,
  type,
  columnName,
  onInspectNested,
}) => {
  if (value === null || value === undefined) {
    return <span className="text-zinc-600 text-xs italic font-mono">null</span>;
  }

  // Boolean Pill
  if (type === 'boolean' || typeof value === 'boolean') {
    return value ? (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>true</span>
      </span>
    ) : (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        <span>false</span>
      </span>
    );
  }

  // Date / Timestamp
  if (value instanceof Date) {
    return (
      <span
        onClick={() => onInspectNested?.(value.toISOString(), `${columnName} (Timestamp)`)}
        className="font-mono text-xs text-amber-300/90 whitespace-nowrap cursor-pointer hover:underline"
        title={value.toISOString()}
      >
        {value.toISOString().replace('T', ' ').replace('Z', '')}
      </span>
    );
  }

  // Nested Object / Array / Struct / Map
  if (typeof value === 'object') {
    const isArray = Array.isArray(value);
    const count = isArray ? value.length : Object.keys(value).length;
    const label = isArray ? `Array(${count})` : `Struct(${count})`;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onInspectNested?.(value, `${columnName} (${label})`);
        }}
        className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/25 text-xs font-mono transition-all cursor-pointer group"
      >
        <span>{label}</span>
        <Eye className="w-3 h-3 text-indigo-400 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  // Numbers (Integers & Floats)
  if (typeof value === 'number') {
    const isFloat = type === 'double' || type === 'float' || type === 'decimal' || value % 1 !== 0;
    return (
      <span className="font-mono text-xs text-emerald-300/90 whitespace-nowrap font-medium">
        {isFloat ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : value.toLocaleString()}
      </span>
    );
  }

  // String / Long text / JSON strings
  const strVal = String(value);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(strVal);

  if (isUuid) {
    return <span className="font-mono text-xs text-purple-300/90">{strVal}</span>;
  }

  const isLongOrJson = strVal.length > 30 || strVal.includes('\n') || (strVal.startsWith('{') && strVal.endsWith('}')) || (strVal.startsWith('[') && strVal.endsWith(']'));

  if (isLongOrJson) {
    return (
      <div
        onClick={() => onInspectNested?.(strVal, `${columnName} (${strVal.length} chars)`)}
        className="flex items-center justify-between space-x-1.5 group/cell cursor-pointer py-0.5"
        title="Click to expand & inspect full cell content"
      >
        <span className="text-xs text-zinc-200 truncate font-mono max-w-[280px]">
          {strVal}
        </span>
        <button
          type="button"
          className="opacity-0 group-hover/cell:opacity-100 p-0.5 rounded bg-white/[0.08] hover:bg-white/[0.15] text-indigo-300 transition-opacity flex-shrink-0"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <span
      onDoubleClick={() => onInspectNested?.(strVal, columnName)}
      className="text-xs text-zinc-200 truncate block max-w-full font-sans"
    >
      {strVal}
    </span>
  );
};
