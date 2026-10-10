# DevDocs Desktop

> Fork of the archived [egoist/devdocs-desktop](https://github.com/egoist/devdocs-desktop), upgraded for modern Electron and current macOS (Apple Silicon + Intel, Sonoma / Sequoia+).

日本語説明ページは[こちら](./README-ja.md)（上游原文，可能已过时）

[DevDocs.io](https://devdocs.io/) combines multiple API documentations in a fast, organized, and searchable interface. This is an unofficial desktop app for it.

![devdocs-preview](https://user-images.githubusercontent.com/8784712/27121730-11676ba8-511b-11e7-8c01-00444ee8501a.png)

## 本 Fork 说明（macOS 升级）

- **Electron**：从 `12.x` 升级到 **44.x**（当前稳定版之一）
- **打包**：`electron-builder` 升级到 `26.x`，macOS 同时产出 **arm64** 与 **x64** 的 DMG/ZIP
- **兼容性目标**：macOS Sonoma / Sequoia 及更新版本，Apple Silicon 与 Intel
- **未内置 Apple 签名密钥**：本地可先打未签名包验证；正式分发需要你自己的 Developer ID + 公证（见下文）

## Features

### Background behavior

When closing the window, the app will continue running in the background, in the dock on macOS and the tray on Linux/Windows. Right-click the dock/tray icon and choose Quit to completely quit the app. On macOS, click the dock icon to show the window. On Linux, right-click the tray icon and choose Toggle to toggle the window. On Windows, click the tray icon to toggle the window.

### Built-in shortcuts

`devdocs` the website itself has great built-in shortcuts support, just check the `help` page in the app.

### Global shortcut

Use <kbd>Ctrl+Shift+D</kbd> (or <kbd>Command+Shift+D</kbd> on macOS) to toggle the app（可在菜单 Preferences 中启用/禁用）.

### Custom protocol

`devdocs://search/keywords` opens a search in the app when registered as the default handler.

## Install

### Manual download

从本仓库 [Releases](https://github.com/GerBawn/devdocs-desktop/releases) 下载对应架构的 macOS 安装包：

- `arm64`：Apple Silicon（M 系列）
- `x64`：Intel Mac

> Homebrew cask 仍指向上游归档项目时，请优先使用本 fork 的 Release。

## Development（本地开发）

需要 **Node.js 22.12+**（Electron 44 要求；推荐 Node 22 LTS）。

依赖升级说明与刻意 pin 的包见 [docs/dependency-notes.md](./docs/dependency-notes.md)。

```bash
git clone https://github.com/GerBawn/devdocs-desktop.git
cd devdocs-desktop
npm install
npm run app
```

编辑 `app/` 下文件后刷新窗口即可；无需 Webpack。

### macOS 上建议验证的清单

在真实 Mac（Sonoma / Sequoia，arm64 或 Intel）上请确认：

1. `npm run app` 能打开窗口并加载 https://devdocs.io
2. 关闭窗口后应用仍留在 Dock；点击 Dock 图标可恢复
3. 全局快捷键 <kbd>Cmd+Shift+D</kbd>（需在菜单里 Enable Global Shortcut）可显示/隐藏
4. 页内搜索 <kbd>Cmd+F</kbd>、缩放、暗色模式切换正常
5. 外链（网页内 `target=_blank`）在系统浏览器中打开
6. `devdocs://search/electron` 协议能唤起搜索（若已注册）
7. 未签名包可能被 Gatekeeper 拦截：系统设置 → 隐私与安全性 → 仍要打开；或执行  
   `xattr -cr /path/to/DevDocs.app`

## Distribute（打包）

### 未签名本地包（验证用）

在 **macOS** 上：

```bash
npm run dist:mac:unsigned
```

产物在 `dist/`（arm64 / x64 的 dmg 与 zip）。

仅生成目录而不打包安装器：

```bash
npm run pack
```

### 签名 + 公证（正式发布）

本仓库 **不包含** Apple 证书或密钥。正式分发请自行准备：

1. Apple Developer 账号与 **Developer ID Application** 证书
2. App 专用密码（App-specific password）与 Team ID
3. 环境变量示例：

```bash
export CSC_LINK=/path/to/certs.p12          # 或把证书装进登录钥匙串
export CSC_KEY_PASSWORD='...'
export APPLE_ID='you@example.com'
export APPLE_APP_SPECIFIC_PASSWORD='...'
export APPLE_TEAM_ID='XXXXXXXXXX'
npm run dist:mac
```

`scripts/notarize.js` 会在缺少上述变量时 **自动跳过公证**，因此 CI/本地未配置密钥时仍可完成构建。

## CI

`.github/workflows/release.yml` 可在 tag `v*` 或 commit message 含 `/release` 时构建。当前默认不要求签名密钥；若要在 CI 公证，请自行添加 GitHub Secrets（`CSC_LINK`、`APPLE_ID` 等）。

## License

MIT © [EGOIST](https://github.com/egoist) — fork maintained at [GerBawn/devdocs-desktop](https://github.com/GerBawn/devdocs-desktop)
