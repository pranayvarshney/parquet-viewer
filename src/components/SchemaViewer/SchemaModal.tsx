import React, { useState } from 'react';
import {
  FileText,
  Layers,
  Database,
  Tag,
  Copy,
  Check,
  TableProperties,
  HardDrive,
  Info,
} from 'lucide-react';
import { ParquetDataFile } from '../../types/parquet';

interface SchemaViewerProps {
  file: ParquetDataFile;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ file }) => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'columns' | 'rowgroups' | 'metadata'>('columns');

  const { metadata } = file;

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalUncompressed = metadata.rowGroups.reduce((acc, rg) => acc + rg.totalByteSize, 0);
  const totalCompressed = metadata.rowGroups.reduce((acc, rg) => acc + rg.totalCompressedSize, 0) || metadata.fileSizeBytes;
  const compressionRatio = totalUncompressed > 0 && totalCompressed > 0
    ? (totalUncompressed / totalCompressed).toFixed(2)
    : '1.0';

  const handleCopySchemaJson = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] p-6 md:p-8 overflow-y-auto select-none">
      {/* File Overview Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
        <div className="p-4 rounded-2xl glass-card">
          <div className="flex items-center space-x-2 text-zinc-400 text-xs mb-1.5">
            <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
              <HardDrive className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">File Size</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {formatBytes(metadata.fileSizeBytes)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
            Ratio: {compressionRatio}x
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card">
          <div className="flex items-center space-x-2 text-zinc-400 text-xs mb-1.5">
            <div className="p-1 rounded-md bg-orange-500/10 text-orange-400">
              <TableProperties className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">Total Rows</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {metadata.numRows.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
            {metadata.numColumns} columns
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card">
          <div className="flex items-center space-x-2 text-zinc-400 text-xs mb-1.5">
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">Row Groups</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {metadata.numRowGroups}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
            ~{(metadata.numRows / Math.max(1, metadata.numRowGroups)).toFixed(0)} rows/group
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1.5">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                <Info className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">Created By</span>
            </div>
            <button
              onClick={handleCopySchemaJson}
              className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-xs cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <div className="text-xs font-mono text-zinc-200 truncate mt-1">
            {metadata.createdBy || 'Unknown / Generated'}
          </div>
          <div className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">
            {file.path || file.name}
          </div>
        </div>
      </div>

      {/* Tabs for Columns vs RowGroups vs KV Metadata */}
      <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-3 mb-5">
        <button
          onClick={() => setActiveSubTab('columns')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeSubTab === 'columns'
              ? 'bg-[#1e1e24] text-white border border-white/[0.12] shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>Column Schema ({metadata.columns.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rowgroups')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeSubTab === 'rowgroups'
              ? 'bg-[#1e1e24] text-white border border-white/[0.12] shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Row Groups ({metadata.rowGroups.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('metadata')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeSubTab === 'metadata'
              ? 'bg-[#1e1e24] text-white border border-white/[0.12] shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span>Custom Metadata ({Object.keys(metadata.keyValueMetadata || {}).length})</span>
        </button>
      </div>

      {/* Tab 1: Column Schema Table */}
      {activeSubTab === 'columns' && (
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#141417] shadow-xl">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-[#18181c] text-zinc-400 border-b border-white/[0.08]">
              <tr>
                <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">#</th>
                <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Column Name</th>
                <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Inferred Type</th>
                <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Logical Type</th>
                <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Physical Type</th>
                <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Repetition</th>
                <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Compression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {metadata.columns.map((col, idx) => (
                <tr key={col.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 text-zinc-500">{idx + 1}</td>
                  <td className="px-4 py-2.5 font-bold text-white">
                    <span>{col.name}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px]">
                      {col.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300">
                    {col.logicalType || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400">
                    {col.physicalType || '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        col.repetitionType === 'REQUIRED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white/[0.06] text-zinc-400'
                      }`}
                    >
                      {col.repetitionType || 'OPTIONAL'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300">
                    {col.compression || 'SNAPPY'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Row Groups Breakdown */}
      {activeSubTab === 'rowgroups' && (
        <div className="space-y-4">
          {metadata.rowGroups.map((rg) => {
            const rgRatio = rg.totalByteSize > 0 && rg.totalCompressedSize > 0
              ? (rg.totalByteSize / rg.totalCompressedSize).toFixed(2)
              : '1.0';

            return (
              <div
                key={rg.index}
                className="p-5 rounded-2xl glass-card shadow-lg"
              >
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 font-bold text-xs font-mono">
                      #{rg.index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        Row Group {rg.index + 1}
                      </h4>
                      <p className="text-xs text-zinc-400 font-mono">
                        {rg.numRows.toLocaleString()} rows
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-5 text-xs font-mono">
                    <div>
                      <span className="text-zinc-500">Uncompressed: </span>
                      <span className="text-zinc-200 font-semibold">{formatBytes(rg.totalByteSize)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Compressed: </span>
                      <span className="text-indigo-400 font-semibold">{formatBytes(rg.totalCompressedSize)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Ratio: </span>
                      <span className="text-emerald-400 font-semibold">{rgRatio}x</span>
                    </div>
                  </div>
                </div>

                {rg.columns.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3 text-xs font-mono">
                    {rg.columns.slice(0, 8).map((colChunk, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 rounded-xl bg-[#121215] border border-white/[0.06]"
                      >
                        <div className="text-zinc-300 font-medium truncate mb-1">
                          {colChunk.columnName}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <span>{colChunk.compression}</span>
                          <span>{formatBytes(colChunk.totalCompressedSize)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Key-Value Metadata */}
      {activeSubTab === 'metadata' && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#141417] p-6 space-y-4 font-mono text-xs shadow-xl">
          {Object.keys(metadata.keyValueMetadata || {}).length === 0 ? (
            <div className="text-center py-12 text-zinc-500 font-sans">
              No custom key-value metadata found in this Parquet file.
            </div>
          ) : (
            Object.entries(metadata.keyValueMetadata || {}).map(([key, val]) => {
              let isJson = false;
              let parsedJson = null;
              try {
                if (val.startsWith('{') || val.startsWith('[')) {
                  parsedJson = JSON.parse(val);
                  isJson = true;
                }
              } catch {}

              return (
                <div key={key} className="p-4 rounded-xl bg-[#18181c] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-indigo-300 font-bold mb-2">
                    <span>{key}</span>
                  </div>
                  {isJson ? (
                    <pre className="p-3.5 rounded-lg bg-[#0c0c0e] text-zinc-300 overflow-x-auto text-[11px] border border-white/[0.04]">
                      {JSON.stringify(parsedJson, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-zinc-300 break-all">{val}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
