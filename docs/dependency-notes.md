# Dependency notes

## Kept on an older major (on purpose)

| Package | Pin | Why |
|---|---|---|
| `electron-store` | `^8.2.0` | Last CommonJS release. Used synchronously from the local renderer/preload (`nodeIntegration`). v9+ is ESM-only and would force a larger module rewrite. |

## Removed (packaged-app / lint breakages)

| Old | Replacement | Why removed |
|---|---|---|
| `electron-is-dev` | `app.isPackaged` | Default `import electron` is undefined → crash in packaged builds. |
| `electron-debug` | `app/dev-shortcuts.js` | Depended on `electron-is-dev`. |
| `electron-context-menu` | `app/context-menu.js` | Depended on `electron-is-dev`. |
| `xo@0.60` | `eslint@10` flat config | xo 0.60 → ESLint 8 → deprecated `@humanwhocodes/*` + `rimraf@3`. xo 5 requires an ESM package (`"type": "module"`), incompatible with this CJS Electron app. |
| `mkdirp` / `semver-compare` / old prettier-config | `fs.mkdirSync` / `semver` / local Prettier | Unmaintained or superseded. |

## Lint stack (current)

- `eslint@^10` + `eslint.config.mjs` (flat config)
- `@eslint/js`, `globals`, `eslint-config-prettier`
- `prettier@^3` (`npm run format`)
- Scripts: `npm run lint` → `eslint .`

## Install deprecations that may remain

A clean `npm install` should **no longer** warn about:

- `eslint@8.57.1`
- `@humanwhocodes/config-array`
- `@humanwhocodes/object-schema`
- `rimraf@3.0.2` (from ESLint 8’s `flat-cache`)

**Still possible (unavoidable on electron-builder 26):**

- `rimraf@2.6.3` via `electron-builder` → `electron-winstaller` → `temp`
- `glob@7` / `inflight` / `boolean` via the same packaging toolchain

Those are not from our lint stack.
