const {Menu, shell, app, BrowserWindow} = require('electron')

/**
 * Lightweight context menu for BrowserWindow / webview WebContents.
 * Avoids electron-context-menu (pulls broken electron-is-dev default import).
 */
function buildTemplate(params, {showInspectElement, webContents}) {
  const selection = (params.selectionText || '').trim()
  const hasText = selection.length > 0
  const isLink = Boolean(params.linkURL)
  const can = (type) => params.editFlags && params.editFlags[`can${type}`]

  const template = [
    {
      label: 'Cut',
      role: 'cut',
      enabled: Boolean(can('Cut')),
      visible: Boolean(params.isEditable)
    },
    {
      label: 'Copy',
      role: 'copy',
      enabled: Boolean(can('Copy')),
      visible: hasText
    },
    {
      label: 'Paste',
      role: 'paste',
      enabled: Boolean(can('Paste')),
      visible: Boolean(params.isEditable)
    },
    {type: 'separator'},
    {
      label: 'Search in Google',
      visible: hasText,
      click() {
        shell.openExternal(
          `https://www.google.com/search?q=${encodeURIComponent(selection)}`
        )
      }
    },
    {
      label: 'Search in DuckDuckGo',
      visible: hasText,
      click() {
        shell.openExternal(
          `https://duckduckgo.com/?q=${encodeURIComponent(selection)}`
        )
      }
    },
    {
      label: 'Open Link',
      visible: isLink,
      click() {
        shell.openExternal(params.linkURL)
      }
    },
    {type: 'separator'},
    {
      label: 'Inspect Element',
      visible: showInspectElement,
      click() {
        webContents.inspectElement(params.x, params.y)
        if (webContents.isDevToolsOpened()) {
          webContents.devToolsWebContents.focus()
        }
      }
    }
  ]

  // Drop hidden items and tidy duplicate/edge separators
  const visible = template.filter((item) => item.visible !== false)
  return visible.filter((item, index, array) => {
    if (item.type !== 'separator') {
      return true
    }

    if (index === 0 || index === array.length - 1) {
      return false
    }

    return array[index - 1].type !== 'separator'
  })
}

function attachContextMenu(webContents, options = {}) {
  const showInspectElement =
    options.showInspectElement === undefined
      ? !app.isPackaged
      : options.showInspectElement

  webContents.on('context-menu', (_event, params) => {
    const menu = Menu.buildFromTemplate(
      buildTemplate(params, {showInspectElement, webContents})
    )
    const win = BrowserWindow.fromWebContents(webContents)
    menu.popup({window: win || undefined})
  })
}

function registerContextMenu(options = {}) {
  const attach = (contents) => {
    attachContextMenu(contents, options)
  }

  for (const win of BrowserWindow.getAllWindows()) {
    attach(win.webContents)
  }

  app.on('browser-window-created', (_event, win) => {
    attach(win.webContents)
  })

  app.on('web-contents-created', (_event, contents) => {
    if (contents.getType() === 'webview') {
      attach(contents)
    }
  })
}

module.exports = {registerContextMenu, attachContextMenu}
