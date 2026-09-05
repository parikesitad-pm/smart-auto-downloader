#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper args parsing
const args = process.argv.slice(2);
let targetVersionArg = args.find((a) => !a.startsWith('-'));
const isPatch = args.includes('--patch');
const isMinor = args.includes('--minor');
const isMajor = args.includes('--major');

const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const currentVersion = pkg.version;

let [major, minor, patch] = currentVersion.split('.').map(Number);

if (isPatch) patch += 1;
else if (isMinor) {
  minor += 1;
  patch = 0;
} else if (isMajor) {
  major += 1;
  minor = 0;
  patch = 0;
} else if (targetVersionArg) {
  targetVersionArg = targetVersionArg.replace(/^v/, '');
  [major, minor, patch] = targetVersionArg.split('.').map(Number);
}

const newVersion = `${major}.${minor}.${patch}`;
const tagVersion = `v${newVersion}`;

console.log('=======================================================');
console.log(`   SMART AUTO DOWNLOADER - BUILD PIPELINE (${tagVersion})`);
console.log('=======================================================');

// 1. Update package.json
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
console.log(`[1/4] Synced package.json -> ${newVersion}`);

// 2. Update Cargo.toml
const cargoPath = path.join(rootDir, 'src-tauri', 'Cargo.toml');
if (fs.existsSync(cargoPath)) {
  let cargo = fs.readFileSync(cargoPath, 'utf-8');
  cargo = cargo.replace(/version\s*=\s*"[^"]+"/, `version = "${newVersion}"`);
  fs.writeFileSync(cargoPath, cargo, 'utf-8');
  console.log(`[2/4] Synced src-tauri/Cargo.toml -> ${newVersion}`);
}

// 3. Update tauri.conf.json
const tauriConfPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
if (fs.existsSync(tauriConfPath)) {
  let tauriConf = fs.readFileSync(tauriConfPath, 'utf-8');
  tauriConf = tauriConf.replace(
    /"version":\s*"[^"]+"/,
    `"version": "${newVersion}"`
  );
  tauriConf = tauriConf.replace(
    /"title":\s*"Smart Auto Downloader v[^"]+"/,
    `"title": "Smart Auto Downloader ${tagVersion}"`
  );
  fs.writeFileSync(tauriConfPath, tauriConf, 'utf-8');
  console.log(`[3/4] Synced src-tauri/tauri.conf.json -> ${newVersion}`);
}

// 4. Update changelog.json
const changelogPath = path.join(rootDir, 'src', 'data', 'changelog.json');
if (fs.existsSync(changelogPath)) {
  const changelog = JSON.parse(fs.readFileSync(changelogPath, 'utf-8'));
  changelog.latestVersion = newVersion;
  changelog.currentVersion = newVersion;

  let exists = false;
  changelog.releases = changelog.releases.map((rel) => {
    if (rel.version === tagVersion) {
      exists = true;
      return { ...rel, isCurrent: true };
    }
    return { ...rel, isCurrent: false };
  });

  if (!exists) {
    changelog.releases.unshift({
      version: tagVersion,
      releaseDate: new Date().toISOString().split('T')[0],
      commitHash: 'release',
      tagline: `Official Release ${tagVersion}`,
      isCurrent: true,
      whatsNew: [
        `Official build ${tagVersion} with clean isolated packaging and SHA256 checksums.`,
      ],
      improvementsAndFixes: [
        'Automated versioned directory output and Windows lock purge.',
      ],
      commitLog: [
        {
          hash: 'release',
          message: `release: rilis versi ${tagVersion}`,
          author: 'parikesitad-pm',
          date: new Date().toISOString().split('T')[0],
        },
      ],
    });
  }

  fs.writeFileSync(
    changelogPath,
    JSON.stringify(changelog, null, 2) + '\n',
    'utf-8'
  );
  console.log(`[4/4] Synced src/data/changelog.json -> ${tagVersion}`);
}

// Pre-build clean
console.log('-------------------------------------------------------');
console.log('Purging frontend dist/ cache & killing active process...');
if (process.platform === 'win32') {
  try {
    execSync('taskkill /F /IM smart-auto-downloader.exe', { stdio: 'ignore' });
  } catch {}
}

const distPath = path.join(rootDir, 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}

// Run Tauri build
console.log('-------------------------------------------------------');
console.log(`Starting Tauri Build for ${tagVersion}...`);

const cargoBin = path.join(process.env.USERPROFILE || '', '.cargo', 'bin');
const env = { ...process.env, Path: `${cargoBin};${process.env.Path}` };

const tauriBuild = spawnSync('npx', ['tauri', 'build'], {
  cwd: rootDir,
  env,
  stdio: 'inherit',
  shell: true,
});

if (tauriBuild.status !== 0) {
  console.error(`Tauri build failed with exit code: ${tauriBuild.status}`);
  process.exit(tauriBuild.status || 1);
}

// Post-build Versioned Output Directory
console.log('-------------------------------------------------------');
console.log(`Organizing releases/${tagVersion}/...`);

const releaseDir = path.join(rootDir, 'releases', tagVersion);
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const srcExe = path.join(
  rootDir,
  'src-tauri',
  'target',
  'release',
  'smart-auto-downloader.exe'
);
const targetExe = path.join(
  releaseDir,
  `smart-auto-downloader-${tagVersion}-windows-x64.exe`
);
if (fs.existsSync(srcExe)) {
  fs.copyFileSync(srcExe, targetExe);
  console.log(`[OK] Copied standalone binary: ${targetExe}`);
}

// Copy NSIS installer
const nsisDir = path.join(
  rootDir,
  'src-tauri',
  'target',
  'release',
  'bundle',
  'nsis'
);
if (fs.existsSync(nsisDir)) {
  const nsisFiles = fs
    .readdirSync(nsisDir)
    .filter((f) => f.endsWith('-setup.exe'));
  if (nsisFiles.length > 0) {
    const latestNsis = path.join(nsisDir, nsisFiles[0]);
    const targetNsis = path.join(
      releaseDir,
      `smart-auto-downloader-${tagVersion}-installer-setup.exe`
    );
    fs.copyFileSync(latestNsis, targetNsis);
    console.log(`[OK] Copied NSIS installer: ${targetNsis}`);
  }
}

// Generate Checksums
console.log('-------------------------------------------------------');
console.log('Generating SHA256 checksums.txt...');
const checksumFile = path.join(releaseDir, 'checksums.txt');
const files = fs.readdirSync(releaseDir).filter((f) => f !== 'checksums.txt');
const checksumLines = files.map((file) => {
  const data = fs.readFileSync(path.join(releaseDir, file));
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `${hash}  ${file}`;
});

fs.writeFileSync(checksumFile, checksumLines.join('\n') + '\n', 'utf-8');
console.log(`[OK] Created checksums: ${checksumFile}`);

console.log('=======================================================');
console.log(`   BUILD RELEASE ${tagVersion} COMPLETED SUCCESSFULLY! `);
console.log('=======================================================');
console.log(`Artifacts located at: ${releaseDir}`);
