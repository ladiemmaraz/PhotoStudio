const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1350,
    height: 850,
    minWidth: 1100,
    minHeight: 650,
    backgroundColor: '#0a0a0c',
    title: 'PhotoStudio Pro - Premium Editor',
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemote: false
    }
  });

  win.loadFile('index.html');
  
  const isPro = () => {
    try {
      const p = path.join(app.getPath('userData'), 'pro-license.json');
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        return data.unlocked === true;
      }
    } catch(e){}
    return false;
  };

  const template = [
    { 
      label: 'File', 
      submenu: [
        { label: '📂 Open Image', accelerator: 'CmdOrCtrl+O', click: () => win.webContents.executeJavaScript("document.getElementById('upload').click()") },
        { type: 'separator' },
        { label: '💾 Export Image (PNG)', accelerator: 'CmdOrCtrl+S', click: () => win.webContents.executeJavaScript('downloadImage()') },
        { label: '💎 Export 4K - PRO', accelerator: 'CmdOrCtrl+Shift+S', click: () => win.webContents.executeJavaScript('download4K()') },
        { type: 'separator' },
        { label: '✂️ Remove Background - PRO', click: () => win.webContents.executeJavaScript('removeBgPro()') },
        { label: '🎬 Export GIF/WebM - PRO', accelerator: 'CmdOrCtrl+E', click: () => win.webContents.executeJavaScript('exportProGif()') },
        { type: 'separator' },
        { label: '💾 Save Project - PRO', click: () => win.webContents.executeJavaScript('saveProject()') },
        { label: '📂 Load Project', click: () => win.webContents.executeJavaScript('loadProject()') },
        { type: 'separator' },
        { role: 'quit', label: 'Quit PhotoStudio Pro' }
      ]
    },
    { 
      label: 'Edit', 
      submenu: [
        { label: '↩️ Clear Canvas', click: () => win.webContents.executeJavaScript('clearCanvas()') },
        { label: '➕ Add Frame', accelerator: 'CmdOrCtrl+K', click: () => win.webContents.executeJavaScript('addFrame()') },
        { label: '▶️ Play Animation', accelerator: 'Space', click: () => win.webContents.executeJavaScript('play()') },
        { role: 'undo' },
        { role: 'redo' }
      ]
    },
    { 
      label: 'Pro', 
      submenu: [
        { label: '🔓 Unlock Pro - £7.99', click: () => win.webContents.executeJavaScript('showUnlock()') },
        { label: '✅ Check License', click: () => {
          const pro = isPro();
          if(pro) dialog.showMessageBox(win, {message: '✅ Pro Active!\nسوپاس بۆ پاڵپشتیت!', type: 'info'});
          else win.webContents.executeJavaScript('showUnlock()');
        }},
        { type: 'separator' },
        { label: '💎 Pro Features', submenu: [
          { label: '6 Pro Filters' },
          { label: 'Remove Background' },
          { label: 'Direct GIF/WebM Export' },
          { label: '4K Export' },
          { label: 'Kurdish Fonts' },
          { label: 'No Watermark' }
        ]},
        { type: 'separator' },
        { label: '🛒 Buy Pro License', click: () => shell.openExternal('https://gumroad.com/l/photostudio-pro') }
      ]
    },
    { 
      label: 'View', 
      submenu: [
        { role: 'reload', label: '🔄 Reload' },
        { role: 'toggleDevTools', label: '🛠️ Developer Tools' },
        { role: 'togglefullscreen', label: '⛶ Fullscreen' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    },
    { 
      label: 'Help', 
      submenu: [
        { label: '📖 About PhotoStudio Pro', click: () => dialog.showMessageBox(win, {
          title: 'About PhotoStudio Pro',
          message: 'PhotoStudio Pro v1.1.0\nPremium Photo & Animation Editor\n\nMade with ❤️ by ladiemmaraz\nKurdish Developer in London\n\nFree version: 8 filters\nPro: 14 filters + BG Remove + GIF Export + 4K + Kurdish Fonts\n\nSupport: github.com/ladiemmaraz/PhotoStudio',
          buttons: ['Close', 'Visit GitHub']
        }).then(r=>{ if(r.response===1) shell.openExternal('https://github.com/ladiemmaraz/PhotoStudio'); })},
        { label: '🌐 GitHub Releases', click: () => shell.openExternal('https://github.com/ladiemmaraz/PhotoStudio/releases') },
        { label: '💬 Support', click: () => shell.openExternal('https://github.com/ladiemmaraz/PhotoStudio/issues') }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Handle external links
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// Security
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});
