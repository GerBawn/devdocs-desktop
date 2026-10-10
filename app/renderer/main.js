const os = require('os')
const fs = require('fs')
const path = require('path')
const {pathToFileURL} = require('url')
const {ipcRenderer: ipc} = require('electron')
const {configDir} = require('../utils')
const config = require('../config')
const Searcher = require('./searcher')

let webview // eslint-disable-line prefer-const

function ensureCustomFiles() {
  fs.mkdirSync(configDir(), {recursive: true})
  const css = configDir('custom.css')
  const js = configDir('custom.js')
  if (!fs.existsSync(css)) {
    fs.writeFileSync(css, '', 'utf8')
  }

  if (!fs.existsSync(js)) {
    fs.writeFileSync(js, '', 'utf8')
  }
}

function createHeader() {
  const header = document.createElement('header')
  header.className = 'header'
  header.innerHTML = '<h1 id="title" class="app-title">Loading DevDocs...</h1>'
  header.addEventListener('dblclick', () => {
    ipc.send('window-maximize')
  })
  header.addEventListener('click', () => {
    webview.focus()
  })

  document.body.append(header)
}

function createWebView() {
  const webviewEl = document.createElement('webview')
  webviewEl.className = 'webview'
  webviewEl.src = 'https://devdocs.io'
  webviewEl.preload = pathToFileURL(path.join(__dirname, 'preload.js')).href
  webviewEl.setAttribute('allowpopups', 'true')
  document.body.append(webviewEl)

  const searcher = new Searcher(webviewEl)

  searcher.on('close', () => {
    webviewEl.focus()
  })

  ipc.on('open-search', () => {
    searcher.open()
  })

  ipc.on('zoom-in', () => {
    webviewEl.send('zoom-in')
  })

  ipc.on('zoom-out', () => {
    webviewEl.send('zoom-out')
  })

  ipc.on('zoom-reset', () => {
    webviewEl.send('zoom-reset')
  })

  ipc.on('focus-webview', () => {
    webviewEl.focus()
  })

  ipc.on('link', (e, url) => {
    const route = url.replace('devdocs://', '')
    const SEACH_RE = /^search\/(.+)$/
    if (SEACH_RE.test(route)) {
      const keyword = SEACH_RE.exec(route)[1]
      webviewEl.src = `https://devdocs.io/#q=${keyword}`
    }
  })

  webviewEl.addEventListener('ipc-message', (e) => {
    if (e.channel === 'switch-mode') {
      const [mode] = e.args
      config.set('mode', mode)
      if (mode === 'dark') {
        document.body.classList.add('is-dark-mode')
      } else {
        document.body.classList.remove('is-dark-mode')
      }
    }
  })

  webviewEl.addEventListener('dom-ready', () => {
    const css = `
    ._app button:focus {
      outline: none;
    }
    ._app button._search-clear {
      top: .5rem;
    }
    `
    webviewEl.insertCSS(css + fs.readFileSync(configDir('custom.css'), 'utf8'))
    webviewEl.executeJavaScript(fs.readFileSync(configDir('custom.js'), 'utf8'))
    webviewEl.focus()
  })

  webviewEl.addEventListener('did-stop-loading', () => {
    const title = webviewEl.getTitle()
    ipc.send('window-set-title', title)
    document.querySelector('#title').textContent = title
  })

  return webviewEl
}

ensureCustomFiles()
createHeader()
webview = createWebView()

document.body.classList.add(`is-${os.platform()}`)

if (config.get('mode') === 'dark') {
  document.body.classList.add('is-dark-mode')
}
