<#
.SYNOPSIS
    Automated Versioned Build & Packaging Pipeline for Smart Auto Downloader
.DESCRIPTION
    1. Synchronizes semantic version across package.json, tauri.conf.json, Cargo.toml, and changelog.json.
    2. Purges frontend cache (dist/) and kills lingering processes to prevent file locking on Windows.
    3. Executes clean Tauri build.
    4. Copies and auto-renames outputs into releases/v<VERSION>/ directory.
    5. Computes SHA256 checksums for all release binaries.
.EXAMPLE
    .\scripts\build-version.ps1 -Version "1.2.1"
    .\scripts\build-version.ps1 -Type patch
    .\scripts\build-version.ps1 -Type minor
#>

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [string]$Version,

    [Parameter()]
    [ValidateSet('patch', 'minor', 'major', 'custom')]
    [string]$Type = 'custom',

    [Parameter()]
    [string]$Description = ''
)

$ErrorActionPreference = 'Stop'

function Set-ContentNoBOM([string]$path, [string]$content) {
    $fullPath = [System.IO.Path]::GetFullPath($path)
    [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.UTF8Encoding]::new($false))
}

function Get-Sha256Checksum([string]$filePath) {
    if (Get-Command Get-FileHash -ErrorAction SilentlyContinue) {
        try {
            return (Get-FileHash -Path $filePath -Algorithm SHA256).Hash
        } catch {}
    }
    # Universal .NET fallback for all PowerShell versions
    $fullPath = [System.IO.Path]::GetFullPath($filePath)
    $stream = [System.IO.File]::OpenRead($fullPath)
    try {
        $sha256 = [System.Security.Cryptography.SHA256]::Create()
        $hashBytes = $sha256.ComputeHash($stream)
        return ([System.BitConverter]::ToString($hashBytes)).Replace("-", "").ToUpper()
    } finally {
        $stream.Close()
    }
}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   SMART AUTO DOWNLOADER - BUILD & RELEASE PIPELINE    " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# STEP 1: SINKRONISASI VERSI OTOMATIS
# -----------------------------------------------------------------------------
$pkgPath = "package.json"
if (-not (Test-Path $pkgPath)) {
    Write-Error "File package.json tidak ditemukan di root direktori!"
}

$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$currentVersion = $pkg.version

$parts = $currentVersion.Split('.')
[int]$major = if ($parts.Length -ge 1) { [int]$parts[0] } else { 1 }
[int]$minor = if ($parts.Length -ge 2) { [int]$parts[1] } else { 0 }
[int]$patch = if ($parts.Length -ge 3) { [int]$parts[2] } else { 0 }

# Tentukan versi target baru
$targetVersion = ""
if (-not [string]::IsNullOrWhiteSpace($Version)) {
    $targetVersion = $Version.TrimStart('v').Trim()
} else {
    switch ($Type) {
        'patch' {
            $patch += 1
            $targetVersion = "$major.$minor.$patch"
        }
        'minor' {
            $minor += 1
            $patch = 0
            $targetVersion = "$major.$minor.$patch"
        }
        'major' {
            $major += 1
            $minor = 0
            $patch = 0
            $targetVersion = "$major.$minor.$patch"
        }
        default {
            $targetVersion = $currentVersion
        }
    }
}

$tagVersion = "v$targetVersion"
if ([string]::IsNullOrWhiteSpace($Description)) {
    $Description = "Build rilis resmi $tagVersion untuk Windows"
}

Write-Host "Versi Saat Ini : v$currentVersion" -ForegroundColor Yellow
Write-Host "Target Versi   : $tagVersion" -ForegroundColor Green
Write-Host "Deskripsi      : $Description" -ForegroundColor Green
Write-Host "-------------------------------------------------------"

# 1. Update package.json
$pkg.version = $targetVersion
Set-ContentNoBOM $pkgPath ($pkg | ConvertTo-Json -Depth 10)
Write-Host "[1/4] Sinkronisasi: package.json -> $targetVersion" -ForegroundColor Green

# 2. Update src-tauri/Cargo.toml
$cargoPath = "src-tauri/Cargo.toml"
if (Test-Path $cargoPath) {
    $cargoContent = Get-Content $cargoPath -Raw
    $cargoContent = $cargoContent -replace '(?m)^version\s*=\s*"[^"]+"', "version = `"$targetVersion`""
    Set-ContentNoBOM $cargoPath $cargoContent
    Write-Host "[2/4] Sinkronisasi: src-tauri/Cargo.toml -> $targetVersion" -ForegroundColor Green
}

# 3. Update src-tauri/tauri.conf.json
$tauriConfPath = "src-tauri/tauri.conf.json"
if (Test-Path $tauriConfPath) {
    $tauriContent = Get-Content $tauriConfPath -Raw
    $tauriContent = $tauriContent -replace '"version":\s*"[^"]+"', "`"version`": `"$targetVersion`""
    $tauriContent = $tauriContent -replace '"title":\s*"Smart Auto Downloader v[^"]+"', "`"title`": `"Smart Auto Downloader $tagVersion`""
    Set-ContentNoBOM $tauriConfPath $tauriContent
    Write-Host "[3/4] Sinkronisasi: src-tauri/tauri.conf.json -> $targetVersion" -ForegroundColor Green
}

# 4. Update src/data/changelog.json
$changelogPath = "src/data/changelog.json"
if (Test-Path $changelogPath) {
    $changelog = Get-Content $changelogPath -Raw | ConvertFrom-Json
    $changelog.latestVersion = $targetVersion
    $changelog.currentVersion = $targetVersion

    $alreadyHasRelease = $false
    foreach ($rel in $changelog.releases) {
        if ($rel.version -eq $tagVersion) {
            $rel.isCurrent = $true
            $alreadyHasRelease = $true
        } else {
            $rel.isCurrent = $false
        }
    }

    if (-not $alreadyHasRelease) {
        $today = (Get-Date).ToString("yyyy-MM-dd")
        $shortHash = "release"
        try {
            $shortHash = (git rev-parse --short HEAD).Trim()
        } catch {
            $shortHash = "build"
        }

        $newReleaseObj = [PSCustomObject]@{
            version = $tagVersion
            releaseDate = $today
            commitHash = $shortHash
            tagline = $Description
            isCurrent = $true
            whatsNew = @("Rilis versi $tagVersion dengan build output terisolasi dan cache bersih.")
            improvementsAndFixes = @("Pembaruan versioned distribution pipeline dan verifikasi SHA256.")
            commitLog = @(
                [PSCustomObject]@{
                    hash = $shortHash
                    message = "release: rilis versi $tagVersion - $Description"
                    author = "parikesitad-pm"
                    date = $today
                }
            )
        }
        $changelog.releases = @($newReleaseObj) + $changelog.releases
    }

    Set-ContentNoBOM $changelogPath ($changelog | ConvertTo-Json -Depth 10)
    Write-Host "[4/4] Sinkronisasi: src/data/changelog.json -> $tagVersion" -ForegroundColor Green
}

# -----------------------------------------------------------------------------
# STEP 2: PRE-BUILD CLEAN & CACHE PURGE (ANTI-LOCK WINDOWS)
# -----------------------------------------------------------------------------
Write-Host "-------------------------------------------------------"
Write-Host "Membersihkan cache build & menghentikan proses aktif..." -ForegroundColor Cyan

# Matikan proses smart-auto-downloader.exe jika sedang berjalan
try {
    Stop-Process -Name smart-auto-downloader -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Proses smart-auto-downloader dihentikan (tidak ada file lock)." -ForegroundColor Green
} catch {
    # Ignore if not running
}

# Hapus cache folder dist/
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    Write-Host "[OK] Folder cache frontend dist/ dihapus." -ForegroundColor Green
}

# Hapus biner lama jika ada agar pasti ter-generate baru
$oldBin = "src-tauri/target/release/smart-auto-downloader.exe"
if (Test-Path $oldBin) {
    Remove-Item -Force $oldBin -ErrorAction SilentlyContinue
}

# -----------------------------------------------------------------------------
# STEP 3: EXECUTE TAURI BUILD
# -----------------------------------------------------------------------------
Write-Host "-------------------------------------------------------"
Write-Host "Memulai kompilasi Tauri Build ($tagVersion)..." -ForegroundColor Cyan

# Pastikan Cargo berada di PATH
$env:Path = "$env:USERPROFILE\.cargo\bin;" + $env:Path

# Jalankan npx tauri build
npx tauri build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Tauri build gagal dengan exit code $LASTEXITCODE"
}

# -----------------------------------------------------------------------------
# STEP 4: POST-BUILD VERSIONED DIRECTORY & AUTO-RENAME (CROSS-PLATFORM)
# -----------------------------------------------------------------------------
Write-Host "-------------------------------------------------------"
Write-Host "Menyusun folder rilis: releases/$tagVersion/..." -ForegroundColor Cyan

$releaseDir = "releases/$tagVersion"
if (-not (Test-Path $releaseDir)) {
    New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null
}

# --- 1. WINDOWS ARTIFACTS (.exe, .zip, .msi, installer) ---
$binSource = "src-tauri/target/release/smart-auto-downloader.exe"
$binTarget = "$releaseDir/smart-auto-downloader-$tagVersion-windows-x64.exe"

if (Test-Path $binSource) {
    Copy-Item -Path $binSource -Destination $binTarget -Force
    Write-Host "[OK] Biner standalone Windows tersimpan: $binTarget" -ForegroundColor Green

    # Otomatis kemas ke berkas ZIP untuk Windows
    $zipTarget = "$releaseDir/smart-auto-downloader-$tagVersion-windows-x64.zip"
    if (Test-Path $zipTarget) { Remove-Item $zipTarget -Force }
    try {
        if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
            Compress-Archive -Path $binTarget -DestinationPath $zipTarget -Force
            Write-Host "[OK] ZIP Portable Windows tersimpan: $zipTarget" -ForegroundColor Green
        } else {
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            $zip = [System.IO.Compression.ZipFile]::Open($zipTarget, [System.IO.Compression.ZipArchiveMode]::Create)
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $binTarget, (Split-Path $binTarget -Leaf))
            $zip.Dispose()
            Write-Host "[OK] ZIP Portable Windows tersimpan (.NET): $zipTarget" -ForegroundColor Green
        }
    } catch {
        Write-Warning "Gagal membuat berkas ZIP otomatis: $_"
    }
}

# Copy installer NSIS (.exe)
$nsisFiles = Get-ChildItem -Path "src-tauri/target/release/bundle/nsis/*-setup.exe" -ErrorAction SilentlyContinue
if ($nsisFiles) {
    $latestNsis = $nsisFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $nsisTarget = "$releaseDir/smart-auto-downloader-$tagVersion-installer-setup.exe"
    Copy-Item -Path $latestNsis.FullName -Destination $nsisTarget -Force
    Write-Host "[OK] NSIS Installer Windows tersimpan: $nsisTarget" -ForegroundColor Green
}

# Copy installer MSI (.msi) jika ada
$msiFiles = Get-ChildItem -Path "src-tauri/target/release/bundle/msi/*.msi" -ErrorAction SilentlyContinue
if ($msiFiles) {
    $latestMsi = $msiFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $msiTarget = "$releaseDir/smart-auto-downloader-$tagVersion-installer.msi"
    Copy-Item -Path $latestMsi.FullName -Destination $msiTarget -Force
    Write-Host "[OK] MSI Installer Windows tersimpan: $msiTarget" -ForegroundColor Green
}

# --- 2. macOS ARTIFACTS (.dmg & .app) ---
$dmgFiles = Get-ChildItem -Path "src-tauri/target/release/bundle/dmg/*.dmg" -ErrorAction SilentlyContinue
if ($dmgFiles) {
    $latestDmg = $dmgFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $dmgTarget = "$releaseDir/smart-auto-downloader-$tagVersion-macos.dmg"
    Copy-Item -Path $latestDmg.FullName -Destination $dmgTarget -Force
    Write-Host "[OK] macOS DMG Installer tersimpan: $dmgTarget" -ForegroundColor Green
}

$macosApp = Get-ChildItem -Path "src-tauri/target/release/bundle/macos" -Directory -Filter "*.app" -ErrorAction SilentlyContinue
if ($macosApp) {
    $appTarget = "$releaseDir/smart-auto-downloader-$tagVersion-macos.app"
    Copy-Item -Path $macosApp.FullName -Destination $appTarget -Recurse -Force
    Write-Host "[OK] macOS App Package tersimpan: $appTarget" -ForegroundColor Green
}

# --- 3. LINUX ARTIFACTS (.AppImage 'app langsung jalan', .deb, & standalone ELF) ---
$appImageFiles = Get-ChildItem -Path "src-tauri/target/release/bundle/appimage/*.AppImage" -ErrorAction SilentlyContinue
if ($appImageFiles) {
    $latestAppImage = $appImageFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $appImageTarget = "$releaseDir/smart-auto-downloader-$tagVersion-linux-x86_64.AppImage"
    Copy-Item -Path $latestAppImage.FullName -Destination $appImageTarget -Force
    Write-Host "[OK] Linux AppImage (App langsung) tersimpan: $appImageTarget" -ForegroundColor Green
}

$debFiles = Get-ChildItem -Path "src-tauri/target/release/bundle/deb/*.deb" -ErrorAction SilentlyContinue
if ($debFiles) {
    $latestDeb = $debFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $debTarget = "$releaseDir/smart-auto-downloader-$tagVersion-linux-amd64.deb"
    Copy-Item -Path $latestDeb.FullName -Destination $debTarget -Force
    Write-Host "[OK] Linux DEB Package tersimpan: $debTarget" -ForegroundColor Green
}

$linuxElf = "src-tauri/target/release/smart-auto-downloader"
if ((Test-Path $linuxElf) -and -not (Test-Path "$linuxElf.exe")) {
    $linuxBinTarget = "$releaseDir/smart-auto-downloader-$tagVersion-linux-x86_64"
    Copy-Item -Path $linuxElf -Destination $linuxBinTarget -Force
    Write-Host "[OK] Linux Biner Standalone tersimpan: $linuxBinTarget" -ForegroundColor Green
}

# -----------------------------------------------------------------------------
# STEP 5: GENERATE SHA256 CHECKSUMS (UNIVERSAL & ROBUST)
# -----------------------------------------------------------------------------
Write-Host "-------------------------------------------------------"
Write-Host "Menghitung SHA256 Checksums..." -ForegroundColor Cyan

$checksumPath = "$releaseDir/checksums.txt"
$checksumLines = @()

Get-ChildItem -Path $releaseDir -File | Where-Object { $_.Name -ne "checksums.txt" } | ForEach-Object {
    $hash = Get-Sha256Checksum $_.FullName
    $line = "$hash  $($_.Name)"
    $checksumLines += $line
}

Set-ContentNoBOM $checksumPath ($checksumLines -join "`r`n")
Write-Host "[OK] File checksums dibuat: $checksumPath" -ForegroundColor Green

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "   BUILD RILIS $tagVersion SELESAI DENGAN SUKSES!       " -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "Lokasi Folder Rilis: $releaseDir" -ForegroundColor Yellow
Get-ChildItem -Path $releaseDir | Select-Object Name, Length | Format-Table -AutoSize
