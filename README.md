# Smart Auto Downloader

[![Tauri v2](https://img.shields.io/badge/Tauri-v2.0-blue.svg?logo=tauri)](https://v2.tauri.app/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.11-ff0055.svg?logo=framer)](https://www.framer.com/motion/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-brown.svg)](https://zustand-demo.pmnd.rs/)
[![Created by](https://img.shields.io/badge/Created_by-parikesitad--pm-purple.svg)](https://github.com/parikesitad-pm)

A modern, high-performance, cross-platform (Windows, macOS, Linux) desktop media downloader built with **Tauri v2 (Rust backend)** and **React + Vite + TypeScript + Tailwind CSS + Framer Motion** frontend.

---

## 📑 Table of Contents

1. [Key Features](#-key-features)
2. [Supported Platforms & Formats](#-supported-platforms--formats)
3. [System Prerequisites (Windows, macOS, Linux)](#-system-prerequisites)
4. [How to Install & Build on Each OS](#-how-to-install--build)
   - [Windows (10 / 11)](#1-windows-10--11)
   - [macOS (Intel & Apple Silicon M1/M2/M3/M4)](#2-macos-intel--apple-silicon)
   - [Linux (Ubuntu / Debian / Fedora / Arch)](#3-linux-ubuntudebianfedoraarch)
5. [How to Use the Application](#-how-to-use-the-application)
6. [Sidecar Binaries Setup (yt-dlp & FFmpeg)](#-sidecar-binaries-setup)
7. [Semantic Versioning & Release Guide for Next Versions](#-versioning--release-guide-for-next-versions)
8. [Architecture & Project Structure](#-architecture--project-structure)
9. [Author & License](#-author--license)

---

## 🌟 Key Features

- **Gemini-Inspired Modern Branding**:
  - Interactive **Edition Pill Badge** (`Community Free` vs `Pro Studio` with dynamic glowing accents).
  - Real-time **Backend Status Indicator** (`Ready` 🟢 / `Downloading` 🔵 / `Error` 🔴).
  - Dual Theme: Smooth Light Mode and Deep Dark Mode with persistent local storage.
- **Minimalist & Interactive Footer**:
  - Permanent author watermark: `Created by parikesitad-pm` (clickable to GitHub profile).
  - Quick action triggers: **[Changelog & Updates]** and **[Help & Docs]**.
- **Systematic Changelog & Git Commit Tracker**:
  - Build-time Git short commit hash injection (e.g. `build #294193c`).
  - Structured `changelog.json` schema comparing Current vs Previous releases, **What's New**, **Improvements & Fixes**, and **Commit Log**.
  - Animated slide-over modal with Framer Motion transitions.
- **Multi-Platform Downloader Pipeline**:
  - **YouTube**: 4K Ultra HD (2160p), 2K (1440p), 1080p, 720p, 480p, Shorts, and Subtitles.
  - **TikTok**: No-Watermark HD video extraction with instant link resolving.
  - **Instagram**: Reels, Carousels, and Post videos.
  - **WhatsApp Status**: Local cache media viewer and exporter.
  - **Audio-Only Studio Converter**: MP3 (320kbps / 192kbps), pristine M4A (AAC), and raw studio WAV.
  - **FFmpeg Auto-Muxing**: Merges separate video and audio streams into a single MP4 container seamlessly.

---

## Supported Platforms & Formats

| Platform       | Supported Media                    | Max Video Quality     | Audio Extraction          |
| :------------- | :--------------------------------- | :-------------------- | :------------------------ |
| **YouTube**    | Standard Videos, Shorts, Playlists | 4K (2160p), 2K, 1080p | MP3 (320k/192k), M4A, WAV |
| **TikTok**     | Videos & Clips (No Watermark)      | Original HD           | MP3, M4A                  |
| **Instagram**  | Reels, Video Posts, IGTV           | Original 1080p        | MP3, M4A                  |
| **WhatsApp**   | Local Status Cache                 | Original Resolution   | Audio / Voice Status      |
| **Direct URL** | MP4, WebM, MKV links               | Best Source Quality   | Original or converted MP3 |

---

## ⚙️ System Prerequisites

Before building or running from source, ensure you have the required prerequisites for your operating system:

### Windows

- **Node.js**: `v18.0.0` or later ([nodejs.org](https://nodejs.org/))
- **C++ Build Tools**: Visual Studio Build Tools 2022 with the "Desktop development with C++" workload installed.
- **Rust Toolchain**: Installed via `rustup` ([rustup.rs](https://rustup.rs/)):
  ```powershell
  winget install Rustlang.Rustup
  # or download and run rustup-init.exe
  rustup default stable-x86_64-pc-windows-msvc
  ```
- **WebView2**: Pre-installed on Windows 10 & 11.

### macOS

- **Node.js**: `v18.0.0` or later (`brew install node`)
- **Xcode Command Line Tools**:
  ```bash
  xcode-select --install
  ```
- **Rust Toolchain**:
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  rustup default stable
  ```

### Linux (Ubuntu / Debian / Fedora / Arch)

- **Node.js**: `v18.0.0` or later
- **System Build Libraries**:
  - **Ubuntu / Debian**:
    ```bash
    sudo apt update
    sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev
    ```
  - **Fedora**:
    ```bash
    sudo dnf install -y webkit2gtk4.1-devel openssl-devel curl wget libappindicator-gtk3-devel librsvg2-devel
    ```
  - **Arch Linux**:
    ```bash
    sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget openssl libappindicator-gtk3 librsvg
    ```
- **Rust Toolchain**:
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  rustup default stable
  ```

---

## 🚀 How to Install & Build

### Clone the Repository

```bash
git clone https://github.com/parikesitad-pm/smart-auto-downloader.git
cd smart-auto-downloader
npm install
```

---

### 1. Windows (10 / 11)

#### Run in Browser Preview (Development)

```powershell
npm run dev
```

Open `http://localhost:1420` in your browser. All UI, queue animations, format selection, and changelog modals will operate with a high-fidelity simulator.

#### Run in Native Desktop Window

```powershell
npm run tauri dev
```

#### Build Production Installer (.exe / .msi)

```powershell
npm run tauri build
```

The compiled installer files will be located in:

- **NSIS Standalone Installer**: `src-tauri/target/release/bundle/nsis/Smart Auto Downloader_x.x.x_x64-setup.exe`
- **MSI Enterprise Installer**: `src-tauri/target/release/bundle/msi/Smart Auto Downloader_x.x.x_x64_en-US.msi`

#### How to Install on Windows:

1. Double-click the generated `.exe` installer.
2. Follow the setup wizard to choose the installation folder and desktop shortcut.
3. Launch **Smart Auto Downloader** from your Start Menu or Desktop.

---

### 2. macOS (Intel & Apple Silicon)

#### Run in Development Mode

```bash
npm run tauri dev
```

#### Build Production Installer (.dmg / .app)

```bash
npm run tauri build
```

For universal binaries (both Intel & Apple Silicon M1/M2/M3/M4):

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
npm run tauri build -- --target universal-apple-darwin
```

The compiled output will be located in:

- **DMG Disk Image**: `src-tauri/target/release/bundle/dmg/Smart Auto Downloader_x.x.x_aarch64.dmg`
- **Application Bundle**: `src-tauri/target/release/bundle/macos/Smart Auto Downloader.app`

#### How to Install on macOS:

1. Double-click the `.dmg` file.
2. Drag **Smart Auto Downloader.app** into your `/Applications` folder.
3. If macOS Gatekeeper displays an untrusted developer prompt:
   - Go to **System Settings > Privacy & Security** and click **Open Anyway**.
   - Or run in Terminal:
     ```bash
     xattr -cr /Applications/Smart\ Auto\ Downloader.app
     ```

---

### 3. Linux (Ubuntu/Debian/Fedora/Arch)

#### Run in Development Mode

```bash
npm run tauri dev
```

#### Build Production Packages (.deb / .AppImage)

```bash
npm run tauri build
```

The compiled packages will be located in:

- **Debian / Ubuntu Package**: `src-tauri/target/release/bundle/deb/smart-auto-downloader_x.x.x_amd64.deb`
- **Universal AppImage**: `src-tauri/target/release/bundle/appimage/smart-auto-downloader_x.x.x_amd64.AppImage`

#### How to Install on Linux:

- **Via .deb (Debian / Ubuntu / Mint)**:
  ```bash
  sudo dpkg -i src-tauri/target/release/bundle/deb/*.deb
  sudo apt-get install -f # resolve any missing dependencies if needed
  ```
- **Via .AppImage (Any Linux Distribution)**:
  ```bash
  chmod +x src-tauri/target/release/bundle/appimage/*.AppImage
  ./src-tauri/target/release/bundle/appimage/*.AppImage
  ```

---

## 📖 How to Use the Application

1. **Copy Media Link**:
   - Copy any video or post link from YouTube, YouTube Shorts, TikTok, or Instagram.
2. **Paste & Auto-Detection**:
   - Open Smart Auto Downloader. The application features auto-paste and detects the source platform with a glowing badge.
3. **Select Format & Quality**:
   - **Video Mode**: Choose between `Best Quality`, `4K (2160p)`, `2K (1440p)`, `1080p Full HD`, `720p HD`, or `480p SD`.
   - **Audio Only Mode**: Select `MP3 320 kbps (Studio Quality)`, `MP3 192 kbps (Standard)`, `M4A (AAC)`, or `WAV (Raw Master)`.
4. **Start Download**:
   - Click the **"Start Download & Muxing"** button.
   - The card transitions into the **Queue** tab with a live shimmer progress bar displaying real-time download speed (`MB/s`), downloaded bytes, percentage, and estimated time of arrival (`ETA`).
5. **Open Downloaded File**:
   - Once completed, click **"Show in Folder"** to open your operating system's native file explorer (Windows File Explorer, macOS Finder, or Linux File Manager) directly at the downloaded file location.
6. **WhatsApp Status Cache Reader**:
   - In Windows or Linux, navigate to Settings or the Status Reader tab to inspect locally cached media and export statuses before the 24-hour expiration window closes.

---

## 📦 Sidecar Binaries Setup

The application automatically utilizes `yt-dlp` and `ffmpeg` for media extraction and video+audio container merging.

### Option A: System PATH (Default & Recommended)

Install `yt-dlp` and `ffmpeg` on your operating system:

- **Windows**:
  ```powershell
  winget install yt-dlp.yt-dlp Gyan.FFmpeg
  ```
- **macOS**:
  ```bash
  brew install yt-dlp ffmpeg
  ```
- **Linux**:
  ```bash
  sudo apt install -y ffmpeg
  sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
  sudo chmod a+rx /usr/local/bin/yt-dlp
  ```

### Option B: Bundled Standalone Sidecars

Place the pre-compiled binaries directly in `src-tauri/bin/` with target-triple suffixes:

- **Windows (x64)**:
  - `src-tauri/bin/yt-dlp-x86_64-pc-windows-msvc.exe`
  - `src-tauri/bin/ffmpeg-x86_64-pc-windows-msvc.exe`
- **macOS (Apple Silicon)**:
  - `src-tauri/bin/yt-dlp-aarch64-apple-darwin`
  - `src-tauri/bin/ffmpeg-aarch64-apple-darwin`
- **macOS (Intel)**:
  - `src-tauri/bin/yt-dlp-x86_64-apple-darwin`
  - `src-tauri/bin/ffmpeg-x86_64-apple-darwin`
- **Linux (x64)**:
  - `src-tauri/bin/yt-dlp-x86_64-unknown-linux-gnu`
  - `src-tauri/bin/ffmpeg-x86_64-unknown-linux-gnu`

---

## 🏷️ Versioning & Release Guide for Next Versions

This project follows an incremental versioning standard:

- **Every minor update / feature addition**: Increment minor version (`v1.1` -> `v1.2` -> `v1.3` ...).
- **Every major architectural overhaul**: Increment major version (`v2.0` -> `v3.0` ...).

### How to Release the Next Version:

Whenever you publish a new version (e.g. `v1.3.0`), update these 4 coordinated files:

1. **`package.json`**:
   ```json
   "version": "1.3.0"
   ```
2. **`src-tauri/Cargo.toml`**:
   ```toml
   version = "1.3.0"
   ```
3. **`src-tauri/tauri.conf.json`**:
   ```json
   "version": "1.3.0",
   "app": {
     "windows": [{ "title": "Smart Auto Downloader v1.3" }]
   }
   ```
4. **`src/data/changelog.json`**:
   - Change `"latestVersion"` and `"currentVersion"` to `"1.3.0"`.
   - Add a new release object at the beginning of `"releases"` with `"isCurrent": true`.
   - Set the previous release's `"isCurrent"` to `false`.
   - Add your list of `"whatsNew"`, `"improvementsAndFixes"`, and `"commitLog"` entries.
5. **Re-build**:
   ```bash
   npm run build          # Builds frontend dist
   npm run tauri build    # Packages native desktop installer
   ```

---

## 🏗️ Architecture & Project Structure

Strict **Atomic Design** hierarchy:

```
src/
├── components/
│   ├── atoms/               # Pure UI elements (Badge, Button, Input, Typography, Watermark, VersionTag, StatusIndicator)
│   ├── molecules/           # Composite molecules (URLInputBar, FormatSelector, DownloadStats, ThemeToggle, VersionCommitBadge)
│   ├── organisms/           # Complex blocks (AppHeader, AppFooter, ChangelogModal, HelpModal, DownloadCard, QueueList, HistoryTable)
│   └── templates/           # Layout wrappers (MainLayout)
├── data/
│   └── changelog.json       # Version history and release data
├── pages/
│   ├── DownloaderPage.tsx   # Downloader input and controls
│   ├── QueuePage.tsx        # Active queue
│   └── SettingsPage.tsx     # Output paths and bitrates
├── store/                   # Zustand stores (downloadStore, versionStore, settingsStore, themeStore)
├── services/                # Tauri IPC bridge & Platform detection
└── types/                   # TypeScript interfaces
```

---

## 👤 Author & Credits

- **Creator & Lead Developer**: [parikesitad-pm](https://github.com/parikesitad-pm)
- **Repository**: [https://github.com/parikesitad-pm/smart-auto-downloader](https://github.com/parikesitad-pm/smart-auto-downloader)
- **License**: MIT License
