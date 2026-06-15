param(
  [int]$Port = 4173
)

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root 'frontend'

if (-not (Test-Path $frontend)) {
  throw "No existe la carpeta frontend."
}

Write-Host "Sirviendo frontend en http://localhost:$Port"
$python = (Get-Command python -ErrorAction Stop).Source
& $python -m http.server $Port --bind 127.0.0.1 --directory $frontend
