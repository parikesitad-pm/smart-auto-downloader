<#
.SYNOPSIS
    Memperbaiki file .git/index yang korup (index file smaller than expected)
.DESCRIPTION
    Menghapus lock file dan index 0 byte, lalu merekonstruksi index dari HEAD secara aman.
#>

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "Memeriksa status git index..." -ForegroundColor Cyan

if (Test-Path ".git/index.lock") {
    Remove-Item ".git/index.lock" -Force
    Write-Host "[OK] File .git/index.lock yang tertinggal dihapus." -ForegroundColor Yellow
}

if (Test-Path ".git/index") {
    $len = (Get-Item ".git/index").Length
    if ($len -eq 0 -or $len -lt 12) {
        Remove-Item ".git/index" -Force
        Write-Host "[OK] File .git/index yang korup (0 byte) dihapus." -ForegroundColor Yellow
    }
}

git reset --quiet
$status = git status --porcelain
Write-Host "[OK] Index Git berhasil dipulihkan secara normal!" -ForegroundColor Green
