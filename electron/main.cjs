const { app, BrowserWindow, shell, ipcMain } = require('electron');
const fs = require('fs');
const http = require('http');
const path = require('path');

// TODO: Replace 480 with actual Steam App ID before release
const STEAM_APP_ID = 480;
let steam = null;
try {
  steam = require('steamworks.js');
  steam.init(STEAM_APP_ID);
  console.log('[Steam] Initialized, user:', steam.localplayer.getName());
} catch (e) {
  console.warn('[Steam] Not available:', e.message);
}

// ── Steam IPC ──────────────────────────────────────────────────────────────
ipcMain.on('steam:available',   e => { e.returnValue = steam !== null; });
ipcMain.on('steam:getUserName', e => { e.returnValue = steam ? steam.localplayer.getName() : null; });
ipcMain.handle('achievement:unlock', async (_, id) => {
  if (!steam) return false;
  try { steam.achievement.activate(id); return true; } catch { return false; }
});
ipcMain.on('achievement:isUnlocked', (e, id) => {
  e.returnValue = steam ? steam.achievement.isActivated(id) : false;
});
ipcMain.handle('steamCloud:save', async (_, key, data) => {
  if (!steam) return false;
  try { steam.cloud.writeFile(key, Buffer.from(JSON.stringify(data), 'utf-8')); return true; } catch { return false; }
});
ipcMain.handle('steamCloud:load', async (_, key) => {
  if (!steam) return null;
  try { return JSON.parse(steam.cloud.readFile(key).toString('utf-8')); } catch { return null; }
});
// ──────────────────────────────────────────────────────────────────────────

let staticServer = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

function createStaticServer(distDir) {
  return new Promise((resolve, reject) => {
    const root = path.resolve(distDir);
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      const requestPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
      const filePath = path.resolve(root, `.${requestPath}`);

      if (!filePath.startsWith(root)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      fs.readFile(filePath, (error, data) => {
        if (error) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      });
    });

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 640,
    height: 1000,
    minWidth: 640,
    minHeight: 960,
    title: 'PokerStrike',
    backgroundColor: '#0d1117',
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const distDir = path.join(__dirname, '..', 'dist');
  if (!staticServer) staticServer = await createStaticServer(distDir);
  const { port } = staticServer.address();
  await win.loadURL(`http://127.0.0.1:${port}/index.html`);
  win.setMenuBarVisibility(false);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);
app.on('before-quit', () => {
  if (staticServer) staticServer.close();
  staticServer = null;
});
app.on('window-all-closed', () => app.quit());
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
