import { app, BrowserWindow, ipcMain, dialog, Menu, MenuItemConstructorOptions } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let fileToOpenOnReady: string | null = null;

// Handle macOS open-file event (e.g. drag to dock icon or double click file)
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('open-file-path', filePath);
  } else {
    fileToOpenOnReady = filePath;
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: 'Parquet Viewer',
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#020617', // slate-950
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Load the app: dev server in development or dist/index.html in production
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.on('did-finish-load', () => {
    if (fileToOpenOnReady) {
      mainWindow?.webContents.send('open-file-path', fileToOpenOnReady);
      fileToOpenOnReady = null;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setupMenu();
}

function setupMenu() {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Parquet File...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            if (mainWindow) {
              const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openFile', 'multiSelections'],
                filters: [
                  { name: 'Parquet Files', extensions: ['parquet', 'pq'] },
                  { name: 'All Files', extensions: ['*'] },
                ],
              });
              if (!result.canceled && result.filePaths.length > 0) {
                mainWindow.webContents.send('open-file-paths', result.filePaths);
              }
            }
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' as const } : { role: 'quit' as const },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'selectAll' as const },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const },
              { type: 'separator' as const },
              { role: 'window' as const },
            ]
          : [{ role: 'close' as const }]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('dialog:openParquet', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Parquet Files', extensions: ['parquet', 'pq'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths;
});

ipcMain.handle('file:readBuffer', async (_event, filePath: string) => {
  try {
    const buffer = await fs.promises.readFile(filePath);
    return {
      success: true,
      name: path.basename(filePath),
      path: filePath,
      size: buffer.byteLength,
      data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to read file',
    };
  }
});

ipcMain.handle('file:saveExport', async (_event, { defaultName, content, format }: { defaultName: string; content: string | Uint8Array; format: string }) => {
  if (!mainWindow) return { success: false, error: 'No active window' };
  
  const extensionsMap: Record<string, string[]> = {
    csv: ['csv'],
    json: ['json'],
    ndjson: ['ndjson', 'jsonl'],
    parquet: ['parquet'],
  };

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: format.toUpperCase(), extensions: extensionsMap[format] || [format] }],
  });

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true };
  }

  try {
    await fs.promises.writeFile(result.filePath, content);
    return { success: true, filePath: result.filePath };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save file' };
  }
});

ipcMain.handle('app:getPlatform', () => {
  return {
    platform: process.platform,
    version: app.getVersion(),
    name: app.getName(),
  };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
