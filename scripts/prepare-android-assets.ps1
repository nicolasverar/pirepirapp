[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$repoPath = $repoRoot.Path.TrimEnd('\')
$sourceRoot = Join-Path $repoPath 'frontend'
$assetsRoot = Join-Path $repoPath 'android\app\src\main\assets'
$targetRoot = Join-Path $assetsRoot 'public'
$expectedSuffix = 'android\app\src\main\assets\public'

function Get-NormalRelativePath {
  param(
    [string]$BasePath,
    [string]$FullPath
  )

  return $FullPath.Substring($BasePath.Length).TrimStart([char[]]'\/') -replace '\\', '/'
}

function Test-ExcludedPath {
  param([string]$RelativePath)

  $firstPart = ($RelativePath -split '/')[0]
  $excludedTopLevel = @('previews', 'data')
  $excludedFiles = @(
    '.nojekyll',
    'reset.html',
    'scripts/config.example.js',
    'icons/icon-192.svg',
    'icons/icon-512.svg',
    'icons/logo.png',
    'icons/pin-lcd.png'
  )

  return $excludedTopLevel -contains $firstPart -or $excludedFiles -contains $RelativePath
}

if (-not (Test-Path -LiteralPath $sourceRoot)) {
  throw "No se encontro frontend en $sourceRoot"
}

New-Item -ItemType Directory -Force -Path $assetsRoot | Out-Null

$targetFull = [System.IO.Path]::GetFullPath($targetRoot)
if (-not $targetFull.StartsWith($repoPath + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Ruta de assets fuera del repo: $targetFull"
}
if (-not $targetFull.EndsWith($expectedSuffix, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Ruta de assets inesperada: $targetFull"
}

if (Test-Path -LiteralPath $targetFull) {
  Remove-Item -LiteralPath $targetFull -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $targetFull | Out-Null

$sourceFull = (Resolve-Path $sourceRoot).Path.TrimEnd('\')
$items = Get-ChildItem -LiteralPath $sourceFull -Recurse -Force

foreach ($item in $items) {
  $relative = Get-NormalRelativePath -BasePath $sourceFull -FullPath $item.FullName
  if (Test-ExcludedPath $relative) {
    continue
  }

  $destination = Join-Path $targetFull ($relative -replace '/', '\')
  if ($item.PSIsContainer) {
    New-Item -ItemType Directory -Force -Path $destination | Out-Null
    continue
  }

  $destinationDir = Split-Path -Parent $destination
  New-Item -ItemType Directory -Force -Path $destinationDir | Out-Null
  Copy-Item -LiteralPath $item.FullName -Destination $destination -Force
}

Copy-Item -LiteralPath (Join-Path $repoPath 'capacitor.config.json') -Destination (Join-Path $assetsRoot 'capacitor.config.json') -Force

$pluginsFile = Join-Path $assetsRoot 'capacitor.plugins.json'
if (-not (Test-Path -LiteralPath $pluginsFile)) {
  Set-Content -LiteralPath $pluginsFile -Value '[]' -NoNewline -Encoding utf8
}

$files = Get-ChildItem -LiteralPath $targetFull -Recurse -File
$bytes = ($files | Measure-Object -Property Length -Sum).Sum
Write-Host "ANDROID_ASSETS_PREPARED files=$($files.Count) bytes=$bytes"
