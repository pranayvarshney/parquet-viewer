import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Percent,
  Hash,
  ListOrdered,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ParquetDataFile } from '../../types/parquet';
import { computeColumnStats } from '../../services/queryEngine';

interface ColumnProfilerProps {
  file: ParquetDataFile;
}

export const ColumnProfiler: React.FC<ColumnProfilerProps> = ({ file }) => {
  const [selectedColumn, setSelectedColumn] = useState<string>(file.columns[0] || '');

  const stats = useMemo(() => {
    if (!selectedColumn) return null;
    return computeColumnStats(file, selectedColumn);
  }, [file, selectedColumn]);

  const isNumeric = stats && (stats.type === 'int32' || stats.type === 'int64' || stats.type === 'float' || stats.type === 'double' || stats.type === 'decimal');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] p-6 md:p-8 overflow-y-auto select-none">
      {/* Header & Column Selector */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span>Column Profiler & Data Analytics</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 pl-7">
            Statistical summaries, null analysis, frequency distributions and histograms
          </p>
        </div>

        {/* Column Picker */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-zinc-400 font-medium">Select Column:</label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="bg-[#18181c] border border-white/[0.12] text-indigo-300 font-mono text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            {file.columns.map((col) => (
              <option key={col} value={col}>
                {col} ({file.columnTypes[col] || 'string'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {stats ? (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {/* Total Count */}
            <div className="p-4 rounded-2xl glass-card">
              <div className="flex items-center space-x-1.5 text-zinc-400 text-xs mb-1.5">
                <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Total Values</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {stats.count.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">Type: {stats.type}</div>
            </div>

            {/* Null Count */}
            <div className="p-4 rounded-2xl glass-card">
              <div className="flex items-center space-x-1.5 text-zinc-400 text-xs mb-1.5">
                <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                  <Percent className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Missing / Null</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {stats.nullCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                {stats.nullPercentage}% nulls
              </div>
            </div>

            {/* Distinct Count */}
            <div className="p-4 rounded-2xl glass-card">
              <div className="flex items-center space-x-1.5 text-zinc-400 text-xs mb-1.5">
                <div className="p-1 rounded-md bg-sky-500/10 text-sky-400">
                  <ListOrdered className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Distinct Values</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {stats.distinctCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                {((stats.distinctCount / (stats.count || 1)) * 100).toFixed(1)}% unique
              </div>
            </div>

            {/* Min Value */}
            <div className="p-4 rounded-2xl glass-card">
              <div className="flex items-center space-x-1.5 text-zinc-400 text-xs mb-1.5">
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Min Value</span>
              </div>
              <div className="text-sm font-bold font-mono text-emerald-400 truncate mt-1">
                {stats.min !== undefined ? String(stats.min) : '—'}
              </div>
            </div>

            {/* Max Value */}
            <div className="p-4 rounded-2xl glass-card">
              <div className="flex items-center space-x-1.5 text-zinc-400 text-xs mb-1.5">
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Max Value</span>
              </div>
              <div className="text-sm font-bold font-mono text-emerald-400 truncate mt-1">
                {stats.max !== undefined ? String(stats.max) : '—'}
              </div>
            </div>

            {/* Mean / Median */}
            <div className="p-4 rounded-2xl glass-card">
              <div className="flex items-center space-x-1.5 text-zinc-400 text-xs mb-1.5">
                <div className="p-1 rounded-md bg-purple-500/10 text-purple-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Mean (Avg)</span>
              </div>
              <div className="text-sm font-bold font-mono text-purple-300 truncate mt-1">
                {stats.mean !== undefined ? stats.mean.toLocaleString() : '—'}
              </div>
              {stats.stdDev !== undefined && (
                <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                  σ = {stats.stdDev}
                </div>
              )}
            </div>
          </div>

          {/* Histogram or Frequency Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Frequent Values */}
            <div className="p-6 rounded-3xl glass-panel shadow-xl">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
                <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <span>Top Frequent Values</span>
              </h3>

              <div className="space-y-3.5">
                {stats.topValues && stats.topValues.length > 0 ? (
                  stats.topValues.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-200 truncate max-w-[70%] font-medium">
                          {item.value || '<empty>'}
                        </span>
                        <span className="text-zinc-400">
                          {item.count.toLocaleString()} <span className="text-zinc-500">({item.percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-2 bg-[#1c1c22] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                          style={{ width: `${Math.max(2, item.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-zinc-500 text-xs py-8">
                    No frequent values found.
                  </div>
                )}
              </div>
            </div>

            {/* Numeric Histogram (if applicable) */}
            {isNumeric && stats.distribution && stats.distribution.length > 0 && (
              <div className="p-6 rounded-3xl glass-panel shadow-xl flex flex-col">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
                  <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span>Value Distribution Histogram</span>
                </h3>

                <div className="flex-1 flex flex-col justify-end space-y-2.5">
                  {stats.distribution.map((bucket, bIdx) => {
                    const maxCount = Math.max(...stats.distribution!.map((d) => d.count), 1);
                    const pct = (bucket.count / maxCount) * 100;

                    return (
                      <div key={bIdx} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-zinc-400">{bucket.bucket}</span>
                          <span className="text-emerald-400 font-semibold">
                            {bucket.count.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2.5 bg-[#1c1c22] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(2, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
