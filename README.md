# Smart Auto Downloader v1

[![Tauri v2](https://img.shields.io/badge/Tauri-v2.0-blue.svg?logo=tauri)](https://v2.tauri.app/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.11-ff0055.svg?logo=framer)](https://www.framer.com/motion/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-brown.svg)](https://zustand-demo.pmnd.rs/)
[![Created by](https://img.shields.io/badge/Created_by-parikesitad--pm-purple.svg)](https://github.com/parikesitad-pm)

A modern, high-performance, cross-platform (Windows, macOS, Linux) desktop media downloader built with **Tauri v2 (Rust backend)** and **React + Vite + TypeScript + Tailwind CSS + Framer Motion** frontend.

---

## 🌟 Key Features

- **Gemini-Inspired Modern Branding**:
  - Top header with interactive **Edition Pill Badge** (`v1.0.0 Community Free` vs `v1.0.0 Pro Studio`).
  - Real-time **Backend Status Indicator** (`Ready` 🟢 / `Downloading` 🔵 / `Error` 🔴).
  - Dual Theme: Smooth Light Mode and Deep Dark Mode with persistent state.
- **Minimalist & Interactive Footer**:
  - Permanent author watermark: `Created by parikesitad-pm` (clickable to GitHub profile).
  - Quick action triggers: **[Changelog & Updates]** and **[Help & Docs]**.
- **Systematic Changelog & Git Commit Tracker**:
  - Build-time Git short commit hash injection (e.g. `build #a1c3e4f`).
  - Structured `changelog.json` schema comparing Current vs Previous releases, **What's New**, **Improvements & Fixes**, and **Commit Log**.
  - Animated slide-over modal with Framer Motion transitions.
- **Multi-Platform Downloader Pipeline**:
  - **YouTube**: 4K Ultra HD (2160p), 2K (1440p), 1080p, 720p, 480p, Shorts, and Subtitles.
  - **TikTok**: No-Watermark HD video extraction with instant link resolving.
  - **Instagram**: Reels, Carousels, and Post videos.
  - **WhatsApp Status**: Local cache media viewer and exporter.
  - **Audio-Only Studio Converter**: MP3 (320kbps / 192kbps), pristine M4A (AAC), and raw studio WAV.
  - **FFmpeg Auto-Muxing**: Merges separate video and audio streams seamlessly.

---

## 🏗️ Atomic Design Architecture

```
smart-auto-downloader/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Badge.tsx               # Status, Platform, and Gemini Edition Badges
│   │   │   ├── Button.tsx              # Interactive button with variants and loading state
│   │   │   ├── Input.tsx               # Styled URL and text inputs
│   │   │   ├── Typography.tsx          # Heading, Text, Muted, and Monospace
│   │   │   ├── Watermark.tsx           # Permanent "Created by parikesitad-pm" link
│   │   │   ├── VersionTag.tsx          # Semantic version & commit hash pill
│   │   │   └── StatusIndicator.tsx     # Pulsing Rust backend state indicator
│   │   ├── molecules/
│   │   │   ├── URLInputBar.tsx         # Auto-paste, clear, and platform badge detection
│   │   │   ├── FormatSelector.tsx      # Video (4K-480p) & Audio (MP3/M4A/WAV) pills
│   │   │   ├── DownloadStats.tsx       # Realtime MB/s, ETA, and downloaded byte metrics
│   │   │   ├── ThemeToggle.tsx         # Animated sun/moon dark/light toggle
│   │   │   └── VersionCommitBadge.tsx  # Interactive Pro/Community tier switcher
│   │   ├── organisms/
│   │   │   ├── AppHeader.tsx           # Header with Branding, Edition Badge, and Status
│   │   │   ├── AppFooter.tsx           # Footer with Watermark, Version, and Modal Triggers
│   │   │   ├── ChangelogModal.tsx      # Systematic release history & commit logs
│   │   │   ├── HelpModal.tsx           # Platform guides and troubleshooting docs
│   │   │   ├── DownloadCard.tsx        # Active card with shimmer progress bar & actions
│   │   │   ├── QueueList.tsx           # Active/queued downloads manager
│   │   │   └── HistoryTable.tsx        # Completed downloads with "Show in Folder"
│   │   └── templates/
│   │       └── MainLayout.tsx          # Shell layout connecting header, body, and footer
│   ├── data/
│   │   └── changelog.json              # Version history, release dates, commits, changes
│   ├── pages/
│   │   ├── DownloaderPage.tsx          # Main downloader input and format controls
│   │   ├── QueuePage.tsx               # Active queue management
│   │   └── SettingsPage.tsx            # Preferences, download paths, audio bitrates
│   ├── store/
│   │   ├── downloadStore.ts            # Download queue, active item, history, backend status
│   │   ├── versionStore.ts             # Edition ('Free'/'Pro'), version, git commit, modals
│   │   ├── settingsStore.ts            # Save directory, default format, auto-muxing
│   │   └── themeStore.ts               # Theme mode (light, dark, system)
│   ├── services/
│   │   ├── tauri.ts                    # Tauri v2 invoke/event bridge with dev mock fallback
│   │   └── platformDetector.ts         # YouTube, TikTok, Instagram, WhatsApp detector
│   └── types/
│       ├── changelog.ts                # TypeScript interface for changelog data
│       ├── download.ts                 # Download status, progress, formats, and platforms
│       ├── settings.ts                 # App settings configuration
│       └── version.ts                  # App edition, build info, backend status
├── src-tauri/
│   ├── Cargo.toml                      # Tauri v2, Tokio, Serde, Regex dependencies
│   ├── tauri.conf.json                 # Tauri window, security, and sidecar config
│   ├── build.rs                        # Compile-time Git short commit hash injector
│   └── src/
│       ├── main.rs                     # Tauri executable entry point
│       ├── lib.rs                      # Tauri command registration & plugin initializer
│       └── commands/
│           ├── download.rs             # Async yt-dlp sidecar runner with stdout regex stream
│           ├── system.rs               # Open download folder & read build metadata
│           └── whatsapp.rs             # Local WhatsApp status cache reader
└── package.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Browser Development Mode (with High-Fidelity Simulation)
```bash
npm run dev
```
Open `http://localhost:1420` to test the full UI, theme switcher, edition badge, changelog modal, and live progress bar simulation.

### 3. Run in Desktop Mode (Tauri v2 + Rust)
Make sure [Rust](https://www.rust-lang.org/) is installed on your system (`rustup` / `cargo`):
```bash
# Verify Rust is available
cargo --version

# Run the Tauri desktop application
npm run tauri dev
```

### 4. Build Production Desktop Application
```bash
npm run tauri build
```
The installer will be generated in `src-tauri/target/release/bundle/`.

---

## 📦 Sidecar Binaries Setup (Optional for standalone distribution)

Place `yt-dlp` and `ffmpeg` binaries in `src-tauri/bin/` with target-triple suffixes:
- **Windows (x64)**: `src-tauri/bin/yt-dlp-x86_64-pc-windows-msvc.exe` and `ffmpeg-x86_64-pc-windows-msvc.exe`
- **macOS (Apple Silicon)**: `src-tauri/bin/yt-dlp-aarch64-apple-darwin`
- **Linux (x64)**: `src-tauri/bin/yt-dlp-x86_64-unknown-linux-gnu`

*(If sidecars are not placed in `bin/`, the application will automatically fall back to the system `PATH` versions).*

---

## 📝 License & Credits

Created with ❤️ by [parikesitad-pm](https://github.com/parikesitad-pm).
Distributed under the MIT License.
