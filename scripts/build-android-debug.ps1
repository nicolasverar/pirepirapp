[CmdletBinding()]
param(
  [switch]$UseRepoGradleHome,
  [switch]$UseLocalGradleHome,
  [switch]$UseTempGradleHome
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$androidDir = Join-Path $repoRoot 'android'
$prepareScript = Join-Path $repoRoot 'scripts\prepare-android-assets.ps1'
$defaultGradleHome = Join-Path $repoRoot '.gradle-user'
$localGradleHome = Join-Path $env:LOCALAPPDATA 'pirepirapp-gradle'

function Get-JavaMajorVersion {
  param([string]$JavaExe)

  if (-not (Test-Path -LiteralPath $JavaExe)) {
    return 0
  }

  $versionText = (& cmd.exe /c "`"$JavaExe`" -version 2>&1") -join "`n"
  if ($versionText -match 'version "1\.(\d+)') {
    return [int]$Matches[1]
  }
  if ($versionText -match 'version "(\d+)') {
    return [int]$Matches[1]
  }
  if ($versionText -match 'openjdk (\d+)') {
    return [int]$Matches[1]
  }
  return 0
}

function Resolve-JavaHome {
  $candidates = @(
    $env:JAVA_HOME,
    $env:ANDROID_STUDIO_JBR,
    'C:\Program Files\Android\Android Studio\jbr'
  ) | Where-Object { $_ }

  foreach ($candidate in $candidates) {
    $javaExe = Join-Path $candidate 'bin\java.exe'
    if ((Get-JavaMajorVersion $javaExe) -ge 21) {
      return $candidate
    }
  }

  throw 'No se encontro JDK/JBR 21. Instala Android Studio o define JAVA_HOME con JDK 21.'
}

function Invoke-GradleBuild {
  param([string]$GradleHome)

  New-Item -ItemType Directory -Force -Path $GradleHome | Out-Null
  Push-Location $androidDir
  try {
    & .\gradlew.bat --gradle-user-home $GradleHome --no-daemon :app:assembleDebug 2>&1 | ForEach-Object { Write-Host $_ }
    $code = $LASTEXITCODE
    return $code
  } finally {
    Pop-Location
  }
}

$javaHome = Resolve-JavaHome
$env:JAVA_HOME = $javaHome
$env:Path = (Join-Path $javaHome 'bin') + ';' + $env:Path

& $prepareScript
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

$configuredGradleHome = ''
$usingTempGradleHome = $false

if ($UseTempGradleHome) {
  $configuredGradleHome = Join-Path $env:TEMP ('pirepirapp-gradle-' + [guid]::NewGuid().ToString('N'))
  $usingTempGradleHome = $true
} elseif ($env:PIREPIRAPP_GRADLE_HOME) {
  $configuredGradleHome = $env:PIREPIRAPP_GRADLE_HOME
} elseif ($UseRepoGradleHome) {
  $configuredGradleHome = $defaultGradleHome
} elseif ($UseLocalGradleHome) {
  $configuredGradleHome = $localGradleHome
} else {
  $configuredGradleHome = Join-Path $env:TEMP ('pirepirapp-gradle-' + [guid]::NewGuid().ToString('N'))
  $usingTempGradleHome = $true
}

$exitCode = Invoke-GradleBuild $configuredGradleHome
if ($exitCode -eq 0) {
  exit 0
}

$canRetryWithTemp = -not $usingTempGradleHome -and -not $env:PIREPIRAPP_GRADLE_HOME
if ($canRetryWithTemp) {
  $tempGradleHome = Join-Path $env:TEMP ('pirepirapp-gradle-' + [guid]::NewGuid().ToString('N'))
  Write-Warning "Build con Gradle home $configuredGradleHome fallo; reintentando con Gradle home temporal: $tempGradleHome"
  $exitCode = Invoke-GradleBuild $tempGradleHome
}

exit $exitCode
