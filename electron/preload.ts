import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  openParquetDialog: () => Promise<string[] | null>;
  readFileBuffer: (filePath: string) => Promise<{
    success: boolean;
    name?: string;
    path?: string;
    size?: number;
    data?: ArrayBuffer;
    error?: string;
  }>;
  saveExport: (options: {
    defaultName: string;
    content: string | Uint8Array;
    format: string;
  }) => Promise<{
    success: boolean;
    filePath?: string;
    canceled?: boolean;
    error?: string;
  }>;
  getPlatform: () => Promise<{
    platform: string;
    version: string;
    name: string;
  }>;
  onOpenFilePath: (callback: (filePath: string) => void) => () => void;
  onOpenFilePaths: (callback: (filePaths: string[]) => void) => () => void;
}

const electronAPI: ElectronAPI = {
  openParquetDialog: () => ipcRenderer.invoke('dialog:openParquet'),
  readFileBuffer: (filePath: string) => ipcRenderer.invoke('file:readBuffer', filePath),
  saveExport: (options) => ipcRenderer.invoke('file:saveExport', options),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  onOpenFilePath: (callback) => {
    const handler = (_event: any, filePath: string) => callback(filePath);
    ipcRenderer.on('open-file-path', handler);
    return () => ipcRenderer.removeListener('open-file-path', handler);
  },
  onOpenFilePaths: (callback) => {
    const handler = (_event: any, filePaths: string[]) => callback(filePaths);
    ipcRenderer.on('open-file-paths', handler);
    return () => ipcRenderer.removeListener('open-file-paths', handler);
  },
};

contextBridge.exposeInMainWorld('electron', electronAPI);
