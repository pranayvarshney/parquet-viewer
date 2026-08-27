import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Code,
  ListTree,
  Table as TableIcon,
  Search,
  Maximize2,
  FileText,
  WrapText,
} from 'lucide-react';

interface NestedInspectorModalProps {
  isOpen: boolean;
  title: string;
  data: any;
  onClose: () => void;
}

export const NestedInspectorModal: React.FC<NestedInspectorModalProps> = ({
  isOpen,
  title,
  data,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wrapText, setWrapText] = useState(true);

  // Parse if data is a JSON string
  const parsedData = useMemo(() => {
    if (typeof data === 'string') {
      const trimmed = data.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          return { isJsonString: true, parsed: JSON.parse(trimmed), raw: data };
        } catch {
          return { isJsonString: false, parsed: null, raw: data };
        }
      }
      return { isJsonString: false, parsed: null, raw: data };
    }
    return { isJsonString: false, parsed: data, raw: typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data) };
  }, [data]);

  const isObjectOrArray = parsedData.isJsonString || (typeof data === 'object' && data !== null && !(data instanceof Date));
  const effectiveData = parsedData.isJsonString ? parsedData.parsed : data;
  const isArrayOfObjects = Array.isArray(effectiveData) && effectiveData.length > 0 && typeof effectiveData[0] === 'object';

  // Default view mode
  const [viewMode, setViewMode] = useState<'formatted' | 'tree' | 'table' | 'raw'>('formatted');

  // Adjust view mode on open
  React.useEffect(() => {
    if (isArrayOfObjects) {
      setViewMode('table');
    } else if (isObjectOrArray) {
      setViewMode('tree');
    } else {
      setViewMode('formatted');
    }
    setSearchQuery('');
  }, [isOpen, data]);

  if (!isOpen) return null;

  const rawString = typeof data === 'string'
    ? data
    : data instanceof Date
    ? data.toISOString()
    : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = rawString.length;
  const lineCount = rawString.split('\n').length;
  const wordCount = rawString.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#121215] border border-white/[0.12] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#16161a] gap-4">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Maximize2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm truncate">{title}</h3>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#0c0c0e] p-0.5 rounded-xl border border-white/[0.08] text-xs">
              {!isObjectOrArray && (
                <button
                  onClick={() => setViewMode('formatted')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'formatted' ? 'bg-[#22222a] text-indigo-400 font-medium' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text</span>
                </button>
              )}

              {isObjectOrArray && (
                <button
                  onClick={() => setViewMode('tree')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'tree' ? 'bg-[#22222a] text-indigo-400 font-medium' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ListTree className="w-3.5 h-3.5" />
                  <span>Tree</span>
                </button>
              )}

              {isArrayOfObjects && (
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-[#22222a] text-indigo-400 font-medium' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              )}

              <button
                onClick={() => setViewMode('raw')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'raw' ? 'bg-[#22222a] text-indigo-400 font-medium' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Raw</span>
              </button>
            </div>

            {/* Wrap text toggle */}
            {(viewMode === 'formatted' || viewMode === 'raw') && (
              <button
                onClick={() => setWrapText(!wrapText)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  wrapText
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'
                    : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white'
                }`}
                title={wrapText ? 'Disable Word Wrap' : 'Enable Word Wrap'}
              >
                <WrapText className="w-4 h-4" />
              </button>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter / Search Bar inside Modal */}
        <div className="px-6 py-2.5 bg-[#0e0e11] border-b border-white/[0.06] flex items-center justify-between gap-4 text-xs font-mono">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search within this cell..."
              className="w-full bg-[#18181c] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-4 text-zinc-500 text-[11px]">
            <span>{charCount.toLocaleString()} chars</span>
            <span>{wordCount.toLocaleString()} words</span>
            {lineCount > 1 && <span>{lineCount.toLocaleString()} lines</span>}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-auto font-mono text-xs select-text">
          {viewMode === 'tree' ? (
            <div className="space-y-1.5">
              <TreeNode value={effectiveData} name="root" isRoot={true} searchQuery={searchQuery} />
            </div>
          ) : viewMode === 'table' && isArrayOfObjects ? (
            <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#141417]">
              <TableInspector rows={effectiveData} searchQuery={searchQuery} />
            </div>
          ) : (
            <pre
              className={`p-4 rounded-2xl bg-[#0c0c0e] border border-white/[0.08] text-indigo-200 selection:bg-indigo-500/30 ${
                wrapText ? 'whitespace-pre-wrap break-all' : 'whitespace-pre overflow-x-auto'
              }`}
            >
              {rawString}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.06] bg-[#0c0c0e] flex items-center justify-between text-xs text-zinc-500 font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>
              {parsedData.isJsonString ? 'Parsed JSON String' : isObjectOrArray ? 'Structured Object' : 'Text Content'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 rounded-xl font-sans font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface TreeNodeProps {
  name: string;
  value: any;
  isRoot?: boolean;
  searchQuery?: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ name, value, isRoot = false, searchQuery = '' }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (value === null || value === undefined) {
    return (
      <div className="flex items-center space-x-2 py-0.5 pl-4">
        {!isRoot && <span className="text-indigo-400 font-semibold">{name}:</span>}
        <span className="text-zinc-600 italic">null</span>
      </div>
    );
  }

  if (typeof value === 'object') {
    const isArray = Array.isArray(value);
    const keys = isArray ? value.map((_, i) => i) : Object.keys(value);

    return (
      <div className="py-0.5">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 cursor-pointer hover:bg-white/[0.04] px-2 py-1 rounded-lg transition-colors select-none"
        >
          <span className="text-zinc-500 font-mono text-[10px]">{isExpanded ? '▼' : '▶'}</span>
          {!isRoot && <span className="text-indigo-300 font-medium">{name}:</span>}
          <span className="text-zinc-500 text-[11px]">
            {isArray ? `Array[${value.length}]` : `Object{${keys.length}}`}
          </span>
        </div>

        {isExpanded && (
          <div className="pl-5 border-l border-white/[0.08] ml-2 space-y-1 mt-1">
            {keys.map((k) => (
              <TreeNode key={k} name={String(k)} value={value[k]} searchQuery={searchQuery} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const strValue = String(value);
  const isMatch = searchQuery && strValue.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className={`flex items-center space-x-2 py-0.5 pl-4 rounded ${isMatch ? 'bg-indigo-500/20' : ''}`}>
      {!isRoot && <span className="text-indigo-400 font-medium">{name}:</span>}
      {typeof value === 'string' ? (
        <span className="text-emerald-400 font-mono break-all">"{value}"</span>
      ) : typeof value === 'number' ? (
        <span className="text-amber-400 font-mono">{value}</span>
      ) : typeof value === 'boolean' ? (
        <span className={value ? 'text-emerald-400' : 'text-rose-400'}>{String(value)}</span>
      ) : (
        <span className="text-zinc-300 break-all">{strValue}</span>
      )}
    </div>
  );
};

const TableInspector: React.FC<{ rows: any[]; searchQuery?: string }> = ({ rows, searchQuery = '' }) => {
  if (!rows || rows.length === 0) return null;

  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r || {}))));

  const filteredRows = searchQuery
    ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(searchQuery.toLowerCase()))
    : rows;

  return (
    <div className="overflow-x-auto max-h-96">
      <table className="w-full text-left border-collapse text-xs font-mono">
        <thead className="bg-[#18181c] text-zinc-400 border-b border-white/[0.08] sticky top-0">
          <tr>
            <th className="px-3 py-2 text-zinc-500">#</th>
            {cols.map((col) => (
              <th key={col} className="px-3 py-2 text-zinc-300 font-semibold border-r border-white/[0.06]">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {filteredRows.map((row, idx) => (
            <tr key={idx} className="hover:bg-white/[0.02]">
              <td className="px-3 py-1.5 text-zinc-500">{idx + 1}</td>
              {cols.map((col) => {
                const v = row[col];
                return (
                  <td key={col} className="px-3 py-1.5 text-zinc-200 border-r border-white/[0.04] max-w-xs truncate">
                    {typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
