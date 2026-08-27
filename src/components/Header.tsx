import React from 'react';
import {
  FileUp,
  Database,
  Code2,
  BarChart3,
  FileSpreadsheet,
  Plus,
  X,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';
import { ParquetDataFile } from '../types/parquet';

interface HeaderProps {
  files: ParquetDataFile[];
  activeFileId: string | null;
  activeTab: 'grid' | 'schema' | 'sql' | 'analytics';
  onSelectFile: (id: string) => void;
  onCloseFile: (id: string) => void;
  onOpenFile: () => void;
  onChangeTab: (tab: 'grid' | 'schema' | 'sql' | 'analytics') => void;
  onOpenExport: () => void;
  onOpenSamples: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  files,
  activeFileId,
  activeTab,
  onSelectFile,
  onCloseFile,
  onOpenFile,
  onChangeTab,
  onOpenExport,
  onOpenSamples,
}) => {
  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <header className="flex flex-col bg-[#121215] border-b border-white/[0.08] select-none z-30">
      {/* Top Bar: macOS titlebar draggable area & Main Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 pl-20 titlebar-drag">
        {/* Left: App Logo & Quick Open */}
        <div className="flex items-center space-x-3 titlebar-no-drag">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-orange-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              Parquet<span className="text-indigo-400">Viewer</span>
            </span>
          </div>

          <div className="h-4 w-px bg-white/[0.08]" />

          <button
            onClick={onOpenFile}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all duration-150 cursor-pointer active:scale-95"
            title="Open local Parquet file (⌘O)"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Open</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 text-[10px] bg-indigo-700/80 rounded text-indigo-100 font-mono">⌘O</kbd>
          </button>

          <button
            onClick={onOpenSamples}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-zinc-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
            title="Load sample dataset"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Sample Data</span>
          </button>
        </div>

        {/* Center: Floating Segmented View Switcher (when file is loaded) */}
        {activeFile && (
          <div className="flex items-center bg-[#18181c] p-1 rounded-2xl border border-white/[0.08] titlebar-no-drag shadow-inner">
            <button
              onClick={() => onChangeTab('grid')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>

            <button
              onClick={() => onChangeTab('schema')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeTab === 'schema'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Schema</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'schema' ? 'bg-indigo-700/80 text-white' : 'bg-white/[0.06] text-zinc-400'
              }`}>
                {activeFile.columns.length}
              </span>
            </button>

            <button
              onClick={() => onChangeTab('sql')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeTab === 'sql'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>SQL</span>
            </button>

            <button
              onClick={() => onChangeTab('analytics')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>
        )}

        {/* Right: Export & File Info */}
        <div className="flex items-center space-x-2 titlebar-no-drag">
          {activeFile && (
            <button
              onClick={onOpenExport}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all duration-150 cursor-pointer active:scale-95"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar for Multiple Opened Parquet Files */}
      {files.length > 0 && (
        <div className="flex items-center px-3 bg-[#0e0e11] overflow-x-auto border-t border-white/[0.06] py-1.5 gap-1.5">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1e1e24] text-white border border-white/[0.12] shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <FileSpreadsheet className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <span className="max-w-[170px] truncate font-mono text-[11px]">{file.name}</span>
                <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 font-mono">
                  {file.totalRows.toLocaleString()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file.id);
                  }}
                  className="p-0.5 rounded-md hover:bg-white/[0.1] text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          <button
            onClick={onOpenFile}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            title="Open another Parquet file"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
