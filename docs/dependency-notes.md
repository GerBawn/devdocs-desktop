# Dependency notes

## Kept on an older major (on purpose)

| Package | Pin | Why |
|---|---|---|
| `electron-store` | `^8.2.0` | Last CommonJS release. Used synchronously from the local renderer/preload (`nodeIntegration`). v9+ is ESM-only and would force a larger module rewrite. |
| `xo` | `^0.60.0` | xo 5 pulls a much newer ESLint flat-config stack; 0.60 upgrades off the ancient 0.27/eslint6 line without a full lint rewrite. |

## Removed (packaged-app breakages)

| Old | Replacement | Why removed |
|---|---|---|
| `electron-is-dev` | `app.isPackaged` / `!app.isPackaged` | Uses `import electron from 'electron'` then `electron.app`; default export is undefined in Electron → `Cannot read properties of undefined (reading 'app')` in packaged builds. |
| `electron-debug` | `app/dev-shortcuts.js` | Depends on `electron-is-dev`. |
| `electron-context-menu` | `app/context-menu.js` | Depends on `electron-is-dev`. |
| `mkdirp` | `fs.mkdirSync(..., { recursive: true })` | Unnecessary dependency. |
| `semver-compare` | `semver` | Unmaintained. |
| `eslint-config-rem`, `@egoist/prettier-config`, `minimist` | local Prettier + xo config | Unused / superseded. |

## Upgraded majors

`dotenv` 18, `prettier` 3, `@electron/notarize` 3 (dynamic `import()`), `axios` 1.20, `electron-log` 5.4, `electron-updater` 6.8, `semver` 7.8.
