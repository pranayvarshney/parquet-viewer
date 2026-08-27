import React, { useState, useEffect, useCallback } from 'react';
import { ParquetDataFile } from './types/parquet';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { DataGrid } from './components/DataGrid/DataGrid';
import { SchemaViewer } from './components/SchemaViewer/SchemaModal';
import { SqlConsole } from './components/SqlConsole/SqlConsole';
import { ColumnProfiler } from './components/Analytics/ColumnProfiler';
import { ExportModal } from './components/ExportModal';
import { StatsBar } from './components/StatsBar';
import { readParquetData } from './services/parquetReader';
import { SampleDatasetInfo, SAMPLE_DATASETS } from './services/sampleGenerator';

export const App: React.FC = () => {
  const [files, setFiles] = useState<ParquetDataFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'schema' | 'sql' | 'analytics'>('grid');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const activeFile = files.find((f) => f.id === activeFileId) || null;

  // Load a Parquet file from an ArrayBuffer
  const loadParquetBuffer = useCallback(
    async (buffer: ArrayBuffer, fileName: string, filePath?: string) => {
      setIsLoading(true);
      setLoadingMessage(`Parsing ${fileName}...`);
      try {
        const parsedFile = await readParquetData(buffer, fileName, filePath);
        setFiles((prev) => [...prev.filter((f) => f.name !== fileName), parsedFile]);
        setActiveFileId(parsedFile.id);
        setActiveTab('grid');
      } catch (err: any) {
        console.error('Failed to parse parquet file:', err);
        alert(`Could not parse Parquet file "${fileName}":\n${err.message || err}`);
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    },
    []
  );

  // Load a file given its local filesystem path via Electron IPC
  const loadFilePath = useCallback(
    async (filePath: string) => {
      if ((window as any).electron?.readFileBuffer) {
        setIsLoading(true);
        setLoadingMessage(`Reading ${filePath.split('/').pop()}...`);
        try {
          const res = await (window as any).electron.readFileBuffer(filePath);
          if (res.success && res.data) {
            await loadParquetBuffer(res.data, res.name || 'file.parquet', res.path);
          } else {
            alert(`Error reading file: ${res.error}`);
          }
        } catch (e: any) {
          alert(`Error reading file: ${e.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [loadParquetBuffer]
  );

  // Open file picker dialog
  const handleOpenFile = useCallback(async () => {
    if ((window as any).electron?.openParquetDialog) {
      const filePaths = await (window as any).electron.openParquetDialog();
      if (filePaths && filePaths.length > 0) {
        for (const fp of filePaths) {
          await loadFilePath(fp);
        }
      }
    } else {
      // Browser input fallback
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.parquet,.pq';
      input.multiple = true;
      input.onchange = async (e: any) => {
        const selectedFiles: FileList = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
          for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const buffer = await file.arrayBuffer();
            await loadParquetBuffer(buffer, file.name);
          }
        }
      };
      input.click();
    }
  }, [loadFilePath, loadParquetBuffer]);

  // Load sample dataset
  const handleSelectSample = useCallback((sample: SampleDatasetInfo) => {
    setIsLoading(true);
    setLoadingMessage(`Loading ${sample.name}...`);
    setTimeout(() => {
      const sampleData = sample.generate();
      setFiles((prev) => [...prev.filter((f) => f.id !== sampleData.id), sampleData]);
      setActiveFileId(sampleData.id);
      setActiveTab('grid');
      setIsLoading(false);
    }, 150);
  }, []);

  // Close an opened file tab
  const handleCloseFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const remaining = prev.filter((f) => f.id !== id);
        if (activeFileId === id) {
          setActiveFileId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
        }
        return remaining;
      });
    },
    [activeFileId]
  );

  // Listen to Electron open-file IPC events
  useEffect(() => {
    if ((window as any).electron?.onOpenFilePaths) {
      const unsubscribe = (window as any).electron.onOpenFilePaths((paths: string[]) => {
        for (const p of paths) {
          loadFilePath(p);
        }
      });
      return () => unsubscribe();
    }
  }, [loadFilePath]);

  useEffect(() => {
    if ((window as any).electron?.onOpenFilePath) {
      const unsubscribe = (window as any).electron.onOpenFilePath((p: string) => {
        loadFilePath(p);
      });
      return () => unsubscribe();
    }
  }, [loadFilePath]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+O: Open File
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFile();
      }
      // Cmd+W: Close current tab
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'w' && activeFileId) {
        e.preventDefault();
        handleCloseFile(activeFileId);
      }
      // Switch view tabs: Cmd+1, Cmd+2, Cmd+3, Cmd+4
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setActiveTab('grid');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setActiveTab('schema');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '3') {
        e.preventDefault();
        setActiveTab('sql');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '4') {
        e.preventDefault();
        setActiveTab('analytics');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenFile, handleCloseFile, activeFileId]);

  // Drag and drop handlers on the main window
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i];
        if ((file as any).path && (window as any).electron?.readFileBuffer) {
          await loadFilePath((file as any).path);
        } else {
          const buffer = await file.arrayBuffer();
          await loadParquetBuffer(buffer, file.name);
        }
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-screen w-screen bg-[#0c0c0e] text-zinc-100 overflow-hidden select-none"
    >
      {/* Top Header & Navigation */}
      <Header
        files={files}
        activeFileId={activeFileId}
        activeTab={activeTab}
        onSelectFile={setActiveFileId}
        onCloseFile={handleCloseFile}
        onOpenFile={handleOpenFile}
        onChangeTab={setActiveTab}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenSamples={() => {
          if (SAMPLE_DATASETS.length > 0) {
            handleSelectSample(SAMPLE_DATASETS[0]);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <div className="text-sm font-semibold text-zinc-200">{loadingMessage || 'Processing Parquet dataset...'}</div>
          </div>
        )}

        {/* If no file is opened, show DropZone landing */}
        {!activeFile ? (
          <DropZone
            onOpenFile={handleOpenFile}
            onSelectSample={handleSelectSample}
            isDraggingOver={isDraggingOver}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'grid' && <DataGrid file={activeFile} />}
            {activeTab === 'schema' && <SchemaViewer file={activeFile} />}
            {activeTab === 'sql' && <SqlConsole file={activeFile} />}
            {activeTab === 'analytics' && <ColumnProfiler file={activeFile} />}
          </div>
        )}
      </main>

      {/* Bottom Status Bar */}
      <StatsBar file={activeFile} />

      {/* Export Modal */}
      {activeFile && (
        <ExportModal
          isOpen={isExportModalOpen}
          file={activeFile}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
};
