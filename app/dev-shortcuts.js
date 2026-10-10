const {app, BrowserWindow} = require('electron')

/**
 * Dev-only keyboard shortcuts (replaces electron-debug).
 * Uses app.isPackaged — no electron-is-dev / remote.
 */
function matchesAccelerator(accelerator, input) {
  const parts = accelerator.split('+')
  const key = parts.pop()
  const code = /^F\d+$/.test(key) ? key : `Key${key}`
  return (
    (input.code === code || input.key.toLowerCase() === key.toLowerCase()) &&
    input.shift === parts.includes('Shift') &&
    input.alt === parts.includes('Alt') &&
    input.meta === parts.includes('Command') &&
    input.control === parts.includes('Control')
  )
}

function toggleDevTools(win) {
  if (!win) return
  const {webContents} = win
  if (webContents.isDevToolsOpened()) {
    webContents.closeDevTools()
  } else {
    webContents.openDevTools({mode: 'bottom'})
  }
}

function inspectElements(win) {
  if (!win) return
  win.webContents.openDevTools({mode: 'bottom'})
  win.webContents.inspectElement(0, 0)
}

function refresh(win) {
  if (!win) return
  win.webContents.reloadIgnoringCache()
}

function registerShortcuts(win) {
  const isMacOS = process.platform === 'darwin'
  const shortcuts = [
    {
      accelerator: isMacOS ? 'Command+Shift+C' : 'Control+Shift+C',
      callback: inspectElements
    },
    {
      accelerator: isMacOS ? 'Command+Alt+I' : 'Control+Shift+I',
      callback: toggleDevTools
    },
    {accelerator: 'F12', callback: toggleDevTools},
    {
      accelerator: isMacOS ? 'Command+R' : 'Control+R',
      callback: refresh
    },
    {accelerator: 'F5', callback: refresh}
  ]

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    const matched = shortcuts.find((s) =>
      matchesAccelerator(s.accelerator, input)
    )
    if (!matched) return
    event.preventDefault()
    matched.callback(win)
  })
}

function registerDevShortcuts() {
  // Only in unpackaged / development runs.
  if (app.isPackaged) {
    return
  }

  for (const win of BrowserWindow.getAllWindows()) {
    registerShortcuts(win)
  }

  app.on('browser-window-created', (_event, win) => {
    registerShortcuts(win)
  })
}

module.exports = {registerDevShortcuts}
