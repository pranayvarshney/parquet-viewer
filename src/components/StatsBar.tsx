import React from 'react';
import { ParquetDataFile } from '../types/parquet';
import { HardDrive, TableProperties, ShieldCheck } from 'lucide-react';

interface StatsBarProps {
  file: ParquetDataFile | null;
}

export const StatsBar: React.FC<StatsBarProps> = ({ file }) => {
  if (!file) {
    return (
      <footer className="flex items-center justify-between px-5 py-2 bg-[#101014] border-t border-white/[0.06] text-[11px] font-mono text-zinc-500 select-none">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-400 font-semibold">Parquet Viewer</span>
          <span className="text-zinc-600">•</span>
          <span>Local-first Offline Parquet Reader</span>
        </div>
        <div className="flex items-center space-x-4 text-[10px]">
          <span><span className="keycap">⌘O</span> Open</span>
          <span><span className="keycap">⌘F</span> Search</span>
          <span><span className="keycap">⌘1-4</span> Views</span>
        </div>
      </footer>
    );
  }

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <footer className="flex items-center justify-between px-5 py-2 bg-[#101014] border-t border-white/[0.06] text-[11px] font-mono text-zinc-400 select-none">
      {/* Left: Row & Column counts */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-zinc-300">
          <TableProperties className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold text-white">{file.rows.length.toLocaleString()}</span>
          <span className="text-zinc-500">rows</span>
        </div>

        <div className="h-3 w-px bg-white/[0.08]" />

        <div>
          <span className="font-bold text-white">{file.columns.length}</span>
          <span className="text-zinc-500"> cols</span>
        </div>

        <div className="h-3 w-px bg-white/[0.08]" />

        <div className="flex items-center space-x-1.5">
          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-zinc-300">{formatBytes(file.metadata.fileSizeBytes)}</span>
          <span className="text-zinc-500">({file.metadata.numRowGroups} group{file.metadata.numRowGroups > 1 ? 's' : ''})</span>
        </div>
      </div>

      {/* Right: Shortcuts & Status */}
      <div className="flex items-center space-x-4 text-[10px] text-zinc-500">
        <span className="hidden sm:inline">
          <span className="keycap">⌘O</span> Open
        </span>
        <span className="hidden sm:inline">
          <span className="keycap">⌘F</span> Search
        </span>
        <span className="hidden sm:inline">
          <span className="keycap">⌘↵</span> Run SQL
        </span>
        <span className="text-emerald-400 flex items-center space-x-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local Engine Active</span>
        </span>
      </div>
    </footer>
  );
};
