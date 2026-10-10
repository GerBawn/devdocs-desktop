require('dotenv').config()

/**
 * Optional macOS notarization hook for electron-builder.
 * Skips when Apple credentials are not present so local/unsigned builds still work.
 *
 * Required env (for a signed+notarized release):
 *   APPLE_ID                     - Apple ID email
 *   APPLE_APP_SPECIFIC_PASSWORD  - App-specific password
 *   APPLE_TEAM_ID                - Team ID from developer.apple.com
 *
 * Also requires a valid Developer ID Application certificate in the keychain
 * (or CSC_LINK / CSC_KEY_PASSWORD for CI).
 */
exports.default = async context => {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appleId = process.env.APPLE_ID || process.env.APPLEID
  const appleIdPassword =
    process.env.APPLE_APP_SPECIFIC_PASSWORD || process.env.APPLEIDPASS
  const teamId = process.env.APPLE_TEAM_ID || process.env.APPLE_TEAMID

  if (!appleId || !appleIdPassword || !teamId) {
    console.log(
      'Skipping notarization: set APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, and APPLE_TEAM_ID to notarize.'
    )
    return
  }

  const { notarize } = require('@electron/notarize')
  const appName = context.packager.appInfo.productFilename

  await notarize({
    tool: 'notarytool',
    appBundleId: 'sh.egoist.devdocs',
    appPath: `${appOutDir}/${appName}.app`,
    appleId,
    appleIdPassword,
    teamId
  })
}
