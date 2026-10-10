# Dependency notes

## Kept on an older major (on purpose)

| Package | Pin | Why |
|---|---|---|
| `electron-store` | `^8.2.0` | Last CommonJS release. Used synchronously from the local renderer/preload (`nodeIntegration`). v9+ is ESM-only and would force a larger module rewrite. |
| `electron-context-menu` | `^4.1.2` | v5 requires Node `>=24`. Host tooling is Node 22 (Electron 44’s embedded Node is 24, but `npm install` runs on the host). |
| `xo` | `^0.60.0` | xo 5 pulls a much newer ESLint flat-config stack; 0.60 upgrades off the ancient 0.27/eslint6 line without a full lint rewrite. |

## Replaced / removed

| Old | Replacement |
|---|---|
| `electron-is-dev` | `!app.isPackaged` |
| `mkdirp` | `fs.mkdirSync(..., { recursive: true })` |
| `semver-compare` | `semver` |
| `eslint-config-rem`, `@egoist/prettier-config`, `minimist` | Dropped (unused / superseded by local Prettier + xo config) |
| `electron-devtools-installer` | Not re-added; `electron-debug` covers DevTools shortcuts |

## Upgraded to current majors

`dotenv` 18, `prettier` 3, `@electron/notarize` 3, `axios` 1.20, `electron-log` 5.4, `electron-updater` 6.8, `electron-debug` 5, `electron-context-menu` 4 (main-process only), `semver` (replaces `semver-compare`).

## ESM loaded via dynamic `import()` from CJS

- `electron-debug`
- `electron-context-menu`
- `@electron/notarize`
