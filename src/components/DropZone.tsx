import React from 'react';
import {
  FileUp,
  Sparkles,
  FolderOpen,
  ArrowRight,
  Zap,
  ShieldCheck,
  Code2,
  TableProperties,
  Cpu,
  Layers,
} from 'lucide-react';
import { SAMPLE_DATASETS, SampleDatasetInfo } from '../services/sampleGenerator';

interface DropZoneProps {
  onOpenFile: () => void;
  onSelectSample: (sample: SampleDatasetInfo) => void;
  isDraggingOver: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onOpenFile,
  onSelectSample,
  isDraggingOver,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 bg-[#0c0c0e] relative select-none overflow-y-auto">
      {/* Ambient Gradient Mesh Background Glow */}
      <div className="absolute top-12 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 translate-x-1/2 w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Onboarding Container */}
      <div className="w-full max-w-3xl flex flex-col items-center z-10 space-y-8 my-auto py-4">
        {/* Header Tag / Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[11px] font-medium text-zinc-300 tracking-wide uppercase">
            Local-First Parquet Studio
          </span>
          <span className="text-zinc-500">•</span>
          <span className="text-[11px] font-mono text-indigo-300">v1.0</span>
        </div>

        {/* Hero Drop Target Card */}
        <div
          onClick={onOpenFile}
          className={`w-full p-8 md:p-10 rounded-3xl transition-all duration-300 flex flex-col items-center text-center cursor-pointer group relative overflow-hidden ${
            isDraggingOver
              ? 'bg-indigo-950/40 border-2 border-indigo-400 scale-[1.02] shadow-2xl shadow-indigo-500/20'
              : 'glass-panel hover:bg-zinc-900/80 hover:border-white/15 shadow-2xl shadow-black/60'
          }`}
        >
          {/* Subtle Corner Glow Accent */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-indigo-500/20 to-orange-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-5 group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
            <FileUp className="w-8 h-8 text-white stroke-[2.2]" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2.5">
            Drop your <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">.parquet</span> file
          </h1>
          <p className="text-sm text-zinc-400 max-w-lg mb-6 leading-relaxed">
            Instant inspection, virtualized browsing across 100K+ rows, DuckDB SQL analytics, and nested struct explorer.
          </p>

          {/* Primary Action Button */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="flex items-center space-x-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Browse Local File</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-indigo-700/80 rounded-md text-indigo-100 font-mono">⌘O</kbd>
            </button>
          </div>

          {/* Feature Badges Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-8 pt-6 border-t border-white/[0.06] text-xs">
            <div className="flex items-center space-x-2 text-zinc-400 justify-center">
              <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium">Snappy & ZSTD</span>
            </div>
            <div className="flex items-center space-x-2 text-zinc-400 justify-center">
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium">100% Offline</span>
            </div>
            <div className="flex items-center space-x-2 text-zinc-400 justify-center">
              <div className="p-1 rounded-md bg-orange-500/10 text-orange-400">
                <TableProperties className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium">Nested Structs</span>
            </div>
            <div className="flex items-center space-x-2 text-zinc-400 justify-center">
              <div className="p-1 rounded-md bg-sky-500/10 text-sky-400">
                <Code2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium">SQL Engine</span>
            </div>
          </div>
        </div>

        {/* Sample Datasets Section */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Or explore sample datasets:</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {SAMPLE_DATASETS.map((sample) => {
              const isSales = sample.id === 'sales';
              return (
                <div
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className="p-5 rounded-2xl glass-card transition-all duration-200 cursor-pointer group flex flex-col justify-between hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSales
                              ? 'bg-orange-500/15 text-orange-400'
                              : 'bg-indigo-500/15 text-indigo-400'
                          }`}
                        >
                          {isSales ? <Layers className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
                        </div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {sample.name}
                        </h3>
                      </div>

                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                        {sample.rowCount.toLocaleString()} rows
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 pl-9">
                      {sample.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center space-x-1.5 overflow-hidden">
                      {sample.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.04] whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all">
                      <span>Load</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Keyboard Quick Navigation Tips */}
        <div className="flex items-center justify-center space-x-6 text-[11px] text-zinc-500 font-mono pt-2">
          <span><span className="keycap">⌘O</span> Open File</span>
          <span><span className="keycap">⌘F</span> Search</span>
          <span><span className="keycap">⌘1-4</span> Switch Views</span>
        </div>
      </div>
    </div>
  );
};
