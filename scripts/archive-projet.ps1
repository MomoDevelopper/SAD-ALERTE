# Archive propre du projet SAD-ALERTE pour soumission jury
# Usage: .\scripts\archive-projet.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DateStamp = Get-Date -Format "yyyy-MM-dd"
$ArchiveDir = Join-Path $ProjectRoot "dist-archives"
$TempDir = Join-Path $env:TEMP "SAD-ALERTE-archive-$DateStamp"
$ZipName = "SAD-ALERTE-soutenance-$DateStamp.zip"
$ZipPath = Join-Path $ArchiveDir $ZipName

$ExcludeDirs = @(
    "node_modules", ".next", "out", "dist", "build",
    ".dart_tool", "venv", "__pycache__",
    "dist-archives", ".git"
)

$ExcludeFiles = @("*.env", ".env.local", "*.log")

Write-Host "==> Copie du projet vers dossier temporaire..."
if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
New-Item -ItemType Directory -Path $TempDir | Out-Null

robocopy $ProjectRoot $TempDir /E /XD $ExcludeDirs /XF $ExcludeFiles /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Erreur robocopy (code $LASTEXITCODE)" }

Write-Host "==> Nettoyage uploads (fichiers uploades, conservation du dossier)..."
$Uploads = Join-Path $TempDir "backend\uploads"
if (Test-Path $Uploads) {
    Get-ChildItem $Uploads -File | Remove-Item -Force -ErrorAction SilentlyContinue
}

Write-Host "==> Creation de l'archive ZIP..."
if (-not (Test-Path $ArchiveDir)) { New-Item -ItemType Directory -Path $ArchiveDir | Out-Null }
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
Compress-Archive -Path (Join-Path $TempDir "*") -DestinationPath $ZipPath -CompressionLevel Optimal

Remove-Item $TempDir -Recurse -Force

$SizeMb = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
Write-Host ""
Write-Host "Archive creee : $ZipPath ($SizeMb Mo)"
Write-Host "Pret pour cle USB ou envoi au jury."
