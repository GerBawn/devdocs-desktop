const {app} = require('electron')
const log = require('electron-log')
const {autoUpdater} = require('electron-updater')

exports.init = () => {
  // Prefer Electron's built-in flag over the electron-is-dev package (ESM-only now).
  if (!app.isPackaged || process.platform === 'linux') {
    return
  }

  autoUpdater.logger = log
  autoUpdater.logger.transports.file.level = 'info'
  autoUpdater.checkForUpdatesAndNotify()
}
