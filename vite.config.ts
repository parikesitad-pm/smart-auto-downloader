import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { execSync } from 'child_process';

// Attempt to get the short git commit hash at build time
let commitHash = 'dev-build';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  commitHash = 'a1c3e4f';
}

import pkg from './package.json';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';

function devDownloaderPlugin() {
  return {
    name: 'dev-downloader-plugin',
    configureServer(server: any) {
      // 1. Endpoint /api/open-folder: Natively open folder and select file in Windows Explorer
      server.middlewares.use('/api/open-folder', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => (body += chunk));
          req.on('end', () => {
            try {
              const { path: targetPath } = JSON.parse(body || '{}');
              const finalPath =
                targetPath ||
                path.join(os.homedir(), 'Downloads', 'SmartAutoDownloader');

              if (process.platform === 'win32') {
                if (fs.existsSync(finalPath) && fs.statSync(finalPath).isFile()) {
                  spawn('explorer.exe', [`/select,"${finalPath}"`], {
                    detached: true,
                    shell: true,
                  });
                } else {
                  spawn('explorer.exe', [`"${finalPath}"`], {
                    detached: true,
                    shell: true,
                  });
                }
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }
        res.statusCode = 405;
        res.end();
      });

      // 2. Endpoint /api/download: Execute real yt-dlp binary with live SSE progress
      server.middlewares.use('/api/download', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => (body += chunk));
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const { url, formatType, videoQuality, audioFormat, outputDir } =
                payload;

              const downloadDir =
                outputDir ||
                path.join(os.homedir(), 'Downloads', 'SmartAutoDownloader');
              fs.mkdirSync(downloadDir, { recursive: true });

              const ytDlpPath = path.resolve(
                __dirname,
                'src-tauri/bin/yt-dlp.exe'
              );
              const ffmpegPath = path.resolve(
                __dirname,
                'src-tauri/bin/ffmpeg.exe'
              );

              const args = [
                '--newline',
                '--progress',
                '--no-warnings',
                '--windows-filenames',
                '--concurrent-fragments',
                '8',
                '--buffer-size',
                '64K',
                '--http-chunk-size',
                '10M',
                '--retries',
                '10',
                '-o',
                path.join(downloadDir, '%(title)s.%(ext)s'),
              ];

              if (fs.existsSync(ffmpegPath)) {
                args.push('--ffmpeg-location', path.dirname(ffmpegPath));
              }

              if (formatType === 'audio') {
                args.push('-x');
                const bitrate =
                  audioFormat && audioFormat.includes('320') ? '320k' : '192k';
                args.push('--audio-format', 'mp3', '--audio-quality', bitrate);
              } else {
                let formatArg = 'bestvideo+bestaudio/best';
                if (videoQuality === '1080p') {
                  formatArg =
                    'bestvideo[height<=1080]+bestaudio/best[height<=1080]';
                } else if (videoQuality === '720p') {
                  formatArg =
                    'bestvideo[height<=720]+bestaudio/best[height<=720]';
                } else if (videoQuality === '2160p') {
                  formatArg =
                    'bestvideo[height<=2160]+bestaudio/best[height<=2160]';
                }
                args.push('-f', formatArg, '--merge-output-format', 'mp4');
              }

              args.push(url);

              res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              });

              const child = spawn(ytDlpPath, args, { windowsHide: true });
              let downloadedFile = '';

              child.stdout.on('data', (data: any) => {
                const text = data.toString();

                const destMatch =
                  text.match(/\[download\] Destination:\s+(.+)/) ||
                  text.match(/\[Merger\] Merging formats into "(.+)"/);
                if (destMatch && destMatch[1]) {
                  downloadedFile = destMatch[1].trim();
                }

                const progMatch = text.match(
                  /\[download\]\s+([\d\.]+)%\s+of\s+~?([\d\.]+)(\w+)\s+at\s+([\d\.]+)(\w+\/s)\s+ETA\s+(\d+):(\d+)/
                );
                if (progMatch) {
                  const percent = parseFloat(progMatch[1]);
                  const sizeVal = parseFloat(progMatch[2]);
                  const sizeUnit = progMatch[3];
                  const speedVal = parseFloat(progMatch[4]);
                  const speedUnit = progMatch[5];
                  const etaSec =
                    parseInt(progMatch[6]) * 60 + parseInt(progMatch[7]);

                  const mult =
                    sizeUnit === 'GiB'
                      ? 1024 * 1024 * 1024
                      : sizeUnit === 'MiB'
                        ? 1024 * 1024
                        : 1024;
                  const totalBytes = Math.round(sizeVal * mult);
                  const speedBytes = Math.round(
                    speedVal * (speedUnit.includes('MiB') ? 1024 * 1024 : 1024)
                  );

                  res.write(
                    `data: ${JSON.stringify({
                      type: 'progress',
                      percentage: percent,
                      totalBytes,
                      downloadedBytes: Math.round(
                        totalBytes * (percent / 100)
                      ),
                      speedBytesPerSec: speedBytes,
                      etaSeconds: etaSec,
                      currentStep: `Mengunduh video asli dari YouTube (${percent.toFixed(1)}%)...`,
                    })}\n\n`
                  );
                }
              });

              child.on('close', (code: any) => {
                if (code === 0) {
                  res.write(
                    `data: ${JSON.stringify({
                      type: 'complete',
                      outputPath: downloadedFile || downloadDir,
                    })}\n\n`
                  );
                } else {
                  res.write(
                    `data: ${JSON.stringify({
                      type: 'error',
                      error: `Proses yt-dlp selesai dengan kode keluar: ${code}`,
                    })}\n\n`
                  );
                }
                res.end();
              });

              child.on('error', (err: any) => {
                res.write(
                  `data: ${JSON.stringify({
                    type: 'error',
                    error: err.message,
                  })}\n\n`
                );
                res.end();
              });
            } catch (e: any) {
              res.write(
                `data: ${JSON.stringify({ type: 'error', error: e.message })}\n\n`
              );
              res.end();
            }
          });
          return;
        }
        res.statusCode = 405;
        res.end();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devDownloaderPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    'import.meta.env.VITE_GIT_COMMIT_HASH': JSON.stringify(commitHash),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
