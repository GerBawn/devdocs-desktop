const path = require('path')
const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron')
const debug = require('debug')('devdocs-desktop:index')
const createMenu = require('./menu')
const config = require('./config')
const tray = require('./tray')
const updater = require('./updater')
const {toggleGlobalShortcut} = require('./utils')
const login = require('./login')

app.setAppUserModelId('sh.egoist.devdocs')

let mainWindow
let isQuitting = false
let urlToOpen

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.show()
  }
})

function toggleWindow() {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow.show()
  }
}

function createMainWindow() {
  const lastWindowState = config.get('lastWindowState')

  const win = new BrowserWindow({
    title: app.name,
    x: lastWindowState.x,
    y: lastWindowState.y,
    width: lastWindowState.width,
    height: lastWindowState.height,
    minWidth: 600,
    minHeight: 400,
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
    trafficLightPosition: {
      x: 10,
      y: 10
    },
    webPreferences: {
      // Local shell UI only (not remote content). Remote DevDocs runs inside <webview>.
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      sandbox: false
    }
  })

  if (process.platform === 'darwin') {
    win.setSheetOffset(24)
  }

  win.loadFile(path.join(__dirname, 'renderer/index.html'))

  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()

      if (process.platform === 'darwin') {
        app.hide()
      } else {
        win.hide()
      }
    }
  })

  return win
}

async function setupDevtoolsAndContextMenu() {
  // ESM-only packages (Electron 44+); load via dynamic import from CJS main.
  const [{default: enableDebug}, {default: contextMenu}] = await Promise.all([
    import('electron-debug'),
    import('electron-context-menu')
  ])

  enableDebug()

  contextMenu({
    showInspectElement: true,
    prepend: (_defaultActions, parameters) => {
      const selection =
        parameters.selectionText && parameters.selectionText.trim()
      const hasText = Boolean(selection)
      return [
        {
          id: 'searchGoogle',
          label: 'Search in Google',
          visible: hasText,
          click() {
            shell.openExternal(
              `https://www.google.com/search?q=${encodeURIComponent(selection)}`
            )
          }
        },
        {
          id: 'searchDuck',
          label: 'Search in DuckDuckGo',
          visible: hasText,
          click() {
            shell.openExternal(
              `https://duckduckgo.com/?q=${encodeURIComponent(selection)}`
            )
          }
        }
      ]
    }
  })
}

app.on(
  'login',
  (event, _webContents, _authenticationResponseDetails, _authInfo, cb) => {
    debug('app.on(login)')
    event.preventDefault()
    login(cb)
  }
)

// Open external links from <webview> guests (replaces removed webview "new-window" event)
app.on('web-contents-created', (_event, contents) => {
  if (contents.getType() === 'webview') {
    contents.setWindowOpenHandler(({url}) => {
      shell.openExternal(url)
      return {action: 'deny'}
    })
  }
})

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})

ipcMain.on('window-set-title', (event, title) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    win.setTitle(title)
  }
})

app.on('ready', async () => {
  await setupDevtoolsAndContextMenu()

  const shortcut = config.get('shortcut')
  for (const name in shortcut) {
    const accelerator = shortcut[name]
    if (accelerator) {
      toggleGlobalShortcut({
        name,
        accelerator,
        registered: false,
        action: toggleWindow
      })
    }
  }

  Menu.setApplicationMenu(
    createMenu({
      toggleWindow
    })
  )
  mainWindow = createMainWindow()
  tray.create(mainWindow)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    updater.init()
    if (urlToOpen) {
      mainWindow.webContents.send('link', urlToOpen)
    }
  })
})

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show()
  }
})

// I have no idea what I'm doing here
// It just works...
let hasOpenedOnce
app.on('browser-window-focus', () => {
  if (hasOpenedOnce) {
    if (mainWindow) {
      mainWindow.webContents.send('focus-webview')
    }
  } else {
    hasOpenedOnce = true
  }
})

app.on('before-quit', () => {
  isQuitting = true

  if (mainWindow && !mainWindow.isFullScreen()) {
    config.set('lastWindowState', mainWindow.getBounds())
  }
})

app.setAsDefaultProtocolClient('devdocs')

app.on('will-finish-launching', () => {
  app.on('open-url', (e, url) => {
    e.preventDefault()
    if (mainWindow) {
      mainWindow.webContents.send('link', url)
    } else {
      urlToOpen = url
    }
  })
})
