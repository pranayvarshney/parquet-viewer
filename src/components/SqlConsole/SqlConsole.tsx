import React, { useState, useEffect } from 'react';
import {
  Play,
  Clock,
  Database,
  Sparkles,
  Download,
  AlertCircle,
} from 'lucide-react';
import { ParquetDataFile } from '../../types/parquet';
import { executeParquetQuery, QueryResult } from '../../services/queryEngine';
import { CellRenderer } from '../DataGrid/CellRenderer';
import { NestedInspectorModal } from '../DataGrid/NestedInspectorModal';
import { exportDataToString } from '../../services/exporter';

interface SqlConsoleProps {
  file: ParquetDataFile;
}

export const SqlConsole: React.FC<SqlConsoleProps> = ({ file }) => {
  const defaultQuery = `SELECT * FROM parquet LIMIT 100;`;

  const [query, setQuery] = useState(defaultQuery);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const [nestedData, setNestedData] = useState<{ open: boolean; title: string; data: any }>({
    open: false,
    title: '',
    data: null,
  });

  useEffect(() => {
    handleRunQuery(defaultQuery);
  }, [file.id]);

  const handleRunQuery = (queryToRun: string) => {
    setError(null);
    setIsExecuting(true);

    try {
      const res = executeParquetQuery(file, queryToRun);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error executing query');
      setResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunQuery(query);
    }
  };

  const firstCategoryCol = file.columns.find((c) => file.columnTypes[c] === 'string') || file.columns[0];
  const firstNumericCol = file.columns.find((c) => ['int32', 'int64', 'double', 'float'].includes(file.columnTypes[c]));

  const queryTemplates = [
    {
      label: 'Preview Top 50',
      query: `SELECT * FROM parquet LIMIT 50;`,
    },
    ...(firstCategoryCol
      ? [
          {
            label: `Count by ${firstCategoryCol}`,
            query: `SELECT ${firstCategoryCol}, COUNT(*) AS total_count FROM parquet GROUP BY ${firstCategoryCol} ORDER BY total_count DESC;`,
          },
        ]
      : []),
    ...(firstCategoryCol && firstNumericCol
      ? [
          {
            label: `Avg ${firstNumericCol} by ${firstCategoryCol}`,
            query: `SELECT ${firstCategoryCol}, COUNT(*) AS count, AVG(${firstNumericCol}) AS avg_${firstNumericCol}, MAX(${firstNumericCol}) AS max_${firstNumericCol} FROM parquet GROUP BY ${firstCategoryCol} ORDER BY avg_${firstNumericCol} DESC;`,
          },
        ]
      : []),
    ...(firstNumericCol
      ? [
          {
            label: `High values (${firstNumericCol})`,
            query: `SELECT * FROM parquet WHERE ${firstNumericCol} > 50 ORDER BY ${firstNumericCol} DESC LIMIT 100;`,
          },
        ]
      : []),
  ];

  const handleExportCsv = () => {
    if (!result || result.rows.length === 0) return;
    const csvContent = exportDataToString(result.rows, result.columns, 'csv');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] select-none overflow-hidden">
      {/* Query Editor Box */}
      <div className="p-4 md:p-5 bg-[#121215] border-b border-white/[0.08] space-y-3">
        {/* Template Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Templates:</span>
            </span>
            {queryTemplates.map((t, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(t.query);
                  handleRunQuery(t.query);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-zinc-300 text-xs font-mono border border-white/[0.08] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-zinc-500 font-mono hidden md:block">
            Press <span className="keycap">⌘ + Enter</span> to execute
          </div>
        </div>

        {/* Textarea Editor */}
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Write your SQL query (e.g. SELECT category, COUNT(*) FROM parquet GROUP BY 1)..."
            className="w-full bg-[#18181c] border border-white/[0.08] focus:border-indigo-500 rounded-2xl p-3.5 text-xs font-mono text-indigo-300 placeholder-zinc-600 focus:outline-none resize-none selection:bg-indigo-500/30 shadow-inner"
          />

          <div className="absolute right-3.5 bottom-4 flex items-center space-x-2">
            <button
              onClick={() => handleRunQuery(query)}
              disabled={isExecuting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run SQL</span>
            </button>
          </div>
        </div>

        {/* Query execution status bar */}
        {result && (
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-semibold">{result.executionTimeMs} ms</span>
              </div>
              <div>
                <span>Returned </span>
                <span className="text-white font-bold">{result.rows.length.toLocaleString()}</span>
                <span> rows ({result.columns.length} columns)</span>
              </div>
            </div>

            {result.rows.length > 0 && (
              <button
                onClick={handleExportCsv}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Query Result Grid */}
      <div className="flex-1 overflow-auto">
        {result && result.rows.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="sticky top-0 z-10 bg-[#141417] border-b border-white/[0.08]">
              <tr>
                <th className="w-12 px-3.5 py-2.5 text-[11px] font-mono text-zinc-500 bg-[#141417] sticky left-0 z-20 border-r border-white/[0.06] text-center">
                  #
                </th>
                {result.columns.map((col) => (
                  <th
                    key={col}
                    className="px-3.5 py-2.5 text-xs font-semibold font-mono text-zinc-300 border-r border-white/[0.06]"
                  >
                    <span>{col}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono text-xs">
              {result.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-3.5 py-2 text-[11px] text-zinc-500 bg-[#0c0c0e] sticky left-0 z-10 border-r border-white/[0.06] text-center">
                    {idx + 1}
                  </td>
                  {result.columns.map((col) => (
                    <td
                      key={col}
                      className="px-3.5 py-2 border-r border-white/[0.04] max-w-xs grid-cell"
                    >
                      <CellRenderer
                        value={row[col]}
                        type={result.columnTypes[col] || 'string'}
                        columnName={col}
                        onInspectNested={(data, title) =>
                          setNestedData({ open: true, title, data })
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !error && (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs">
              <Database className="w-8 h-8 text-zinc-700 mb-2" />
              <span>No query executed yet or 0 rows returned.</span>
            </div>
          )
        )}
      </div>

      {/* Nested Inspector Modal */}
      <NestedInspectorModal
        isOpen={nestedData.open}
        title={nestedData.title}
        data={nestedData.data}
        onClose={() => setNestedData({ open: false, title: '', data: null })}
      />
    </div>
  );
};
