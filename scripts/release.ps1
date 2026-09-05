<#
.SYNOPSIS
    Script helper otomatisasi rilis Smart Auto Downloader
.DESCRIPTION
    Menaikkan versi (patch/minor/major), menyinkronkan file config & changelog,
    membuat conventional commit Bahasa Indonesia, membuat Git tag, dan push ke GitHub.
.EXAMPLE
    .\scripts\release.ps1 -Type minor -Message "tambah pemilih resolusi video dan opsi audio mp3"
    .\scripts\release.ps1 -Type patch -Message "perbaikan bug parsing link tiktok"
    .\scripts\release.ps1 -Type major -Message "rombak total arsitektur ke versi 2.0"
#>

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [ValidateSet('patch', 'minor', 'major')]
    [string]$Type = 'minor',

    [Parameter(Position = 1)]
    [string]$Message = '',

    [switch]$NoPush
)

$ErrorActionPreference = 'Stop'

function Set-ContentNoBOM([string]$path, [string]$content) {
    $fullPath = [System.IO.Path]::GetFullPath($path)
    [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.UTF8Encoding]::new($false))
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  SMART AUTO DOWNLOADER - RELEASE HELPER " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Pastikan repo bersih dari file lock/corrupt
if (Test-Path ".git/index.lock") {
    Remove-Item ".git/index.lock" -Force
}

# 2. Baca versi saat ini dari package.json
$pkgPath = "package.json"
if (-not (Test-Path $pkgPath)) {
    Write-Error "File package.json tidak ditemukan!"
}
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$currentVersion = $pkg.version

# Parse semantic version (Major.Minor.Patch)
$parts = $currentVersion.Split('.')
[int]$major = if ($parts.Length -ge 1) { [int]$parts[0] } else { 1 }
[int]$minor = if ($parts.Length -ge 2) { [int]$parts[1] } else { 0 }
[int]$patch = if ($parts.Length -ge 3) { [int]$parts[2] } else { 0 }

# Hitung versi baru
switch ($Type) {
    'patch' {
        $patch += 1
    }
    'minor' {
        $minor += 1
        $patch = 0
    }
    'major' {
        $major += 1
        $minor = 0
        $patch = 0
    }
}
$newVersion = "$major.$minor.$patch"
$tagVersion = "v$newVersion"

if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = switch ($Type) {
        'patch' { "perbaikan bug dan optimasi performa" }
        'minor' { "penambahan fitur baru dan stabilitas rilis" }
        'major' { "pembaruan arsitektur besar generasi berikutnya" }
    }
}

Write-Host "Versi Saat Ini : v$currentVersion" -ForegroundColor Yellow
Write-Host "Tipe Update    : $Type" -ForegroundColor Yellow
Write-Host "Versi Baru     : $tagVersion" -ForegroundColor Green
Write-Host "Deskripsi      : $Message" -ForegroundColor Green
Write-Host "-----------------------------------------"

# 3. Update package.json
$pkg.version = $newVersion
Set-ContentNoBOM $pkgPath ($pkg | ConvertTo-Json -Depth 10)
Write-Host "[OK] Diperbarui: package.json -> $newVersion" -ForegroundColor Green

# 4. Update src-tauri/Cargo.toml
$cargoPath = "src-tauri/Cargo.toml"
if (Test-Path $cargoPath) {
    $cargoContent = Get-Content $cargoPath -Raw
    $cargoContent = $cargoContent -replace '(?m)^version\s*=\s*"[^"]+"', "version = `"$newVersion`""
    Set-ContentNoBOM $cargoPath $cargoContent
    Write-Host "[OK] Diperbarui: src-tauri/Cargo.toml -> $newVersion" -ForegroundColor Green
}

# 5. Update src-tauri/tauri.conf.json
$tauriConfPath = "src-tauri/tauri.conf.json"
if (Test-Path $tauriConfPath) {
    $tauriContent = Get-Content $tauriConfPath -Raw
    $tauriContent = $tauriContent -replace '"version":\s*"[^"]+"', "`"version`": `"$newVersion`""
    $tauriContent = $tauriContent -replace '"title":\s*"Smart Auto Downloader v[^"]+"', "`"title`": `"Smart Auto Downloader v$major.$minor`""
    Set-ContentNoBOM $tauriConfPath $tauriContent
    Write-Host "[OK] Diperbarui: src-tauri/tauri.conf.json -> $newVersion" -ForegroundColor Green
}

# 6. Update src/data/changelog.json
$changelogPath = "src/data/changelog.json"
if (Test-Path $changelogPath) {
    $changelog = Get-Content $changelogPath -Raw | ConvertFrom-Json
    $changelog.latestVersion = $newVersion
    $changelog.currentVersion = $newVersion

    # Set semua rilis sebelumnya isCurrent = false
    foreach ($rel in $changelog.releases) {
        $rel.isCurrent = $false
    }

    $today = (Get-Date).ToString("yyyy-MM-dd")
    $shortHash = "dev"
    try {
        $shortHash = (git rev-parse --short HEAD).Trim()
    } catch {
        $shortHash = "build"
    }

    $newRelease = [PSCustomObject]@{
        version = $tagVersion
        releaseDate = $today
        commitHash = $shortHash
        tagline = $Message
        isCurrent = $true
        whatsNew = @("Rilis $tagVersion: $Message")
        improvementsAndFixes = @("Sinkronisasi otomatis build dan konfigurasi cross-platform")
        commitLog = @(
            [PSCustomObject]@{
                hash = $shortHash
                message = "release: rilis versi $tagVersion - $Message"
                author = "parikesitad-pm"
                date = $today
            }
        )
    }

    $changelog.releases = @($newRelease) + $changelog.releases
    $changelog | ConvertTo-Json -Depth 10 | Set-Content $changelogPath -Encoding UTF8
    Write-Host "[OK] Diperbarui: src/data/changelog.json -> $tagVersion" -ForegroundColor Green
}

# 7. Git commit & Tag
Write-Host "-----------------------------------------"
Write-Host "Mengeksekusi Git Staging dan Commit..." -ForegroundColor Cyan

git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json src/data/changelog.json README.md .gitignore .github/

$commitMsg = "release: rilis versi $tagVersion - $Message"
git commit -m "$commitMsg"
Write-Host "[OK] Commit dibuat: $commitMsg" -ForegroundColor Green

# 8. Buat Git Tag
git tag -a "$tagVersion" -m "Release $tagVersion - $Message"
Write-Host "[OK] Tag dibuat: $tagVersion" -ForegroundColor Green

# 9. Push ke remote jika tidak di-skip
if (-not $NoPush) {
    Write-Host "Mendorong perubahan dan tags ke GitHub..." -ForegroundColor Cyan
    git push origin main --tags
    Write-Host "[SUKSES] Versi $tagVersion dan tag berhasil di-push ke GitHub!" -ForegroundColor Green
    Write-Host "Workflow GitHub Actions akan otomatis mengompilasi installer dan merilis di tab Releases!" -ForegroundColor Cyan
} else {
    Write-Host "[INFO] Parameter -NoPush aktif. Silakan push manual dengan: git push origin main --tags" -ForegroundColor Yellow
}
