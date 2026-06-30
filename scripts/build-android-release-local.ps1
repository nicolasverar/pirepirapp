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
$signingDir = Join-Path $env:LOCALAPPDATA 'Pirepirapp\android-signing'
$signingConfigPath = Join-Path $signingDir 'local-release-signing.json'
$keystorePath = Join-Path $signingDir 'pirepirapp-local-release.keystore'
$keyAlias = 'pirepirapp-local-release'
$unsignedApk = Join-Path $androidDir 'app\build\outputs\apk\release\app-release-unsigned.apk'
$alignedApk = Join-Path $androidDir 'app\build\outputs\apk\release\app-release-local-aligned.apk'
$signedApk = Join-Path $androidDir 'app\build\outputs\apk\release\app-release-local-signed.apk'
$signedApkIdsig = "$signedApk.idsig"

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

function Resolve-AndroidSdk {
  if ($env:ANDROID_HOME -and (Test-Path -LiteralPath $env:ANDROID_HOME)) {
    return $env:ANDROID_HOME
  }

  $localProperties = Join-Path $androidDir 'local.properties'
  if (Test-Path -LiteralPath $localProperties) {
    $line = Get-Content -LiteralPath $localProperties | Where-Object { $_ -like 'sdk.dir=*' } | Select-Object -First 1
    if ($line) {
      $sdk = $line.Substring(8).Replace('\:', ':').Replace('\\', '\')
      if (Test-Path -LiteralPath $sdk) {
        return $sdk
      }
    }
  }

  throw 'No se encontro Android SDK. Abri Android Studio o define ANDROID_HOME.'
}

function Resolve-BuildTool {
  param(
    [string]$Sdk,
    [string]$Name
  )

  $tool = Get-ChildItem -LiteralPath (Join-Path $Sdk 'build-tools') -Recurse -Filter $Name |
    Sort-Object FullName -Descending |
    Select-Object -First 1
  if (-not $tool) {
    throw "No se encontro $Name en Android SDK build-tools."
  }
  return $tool.FullName
}

function New-Secret {
  return (([guid]::NewGuid().ToString('N')) + ([guid]::NewGuid().ToString('N')))
}

function Resolve-LocalSigning {
  param([string]$Keytool)

  New-Item -ItemType Directory -Force -Path $signingDir | Out-Null

  if ((Test-Path -LiteralPath $signingConfigPath) -and (Test-Path -LiteralPath $keystorePath)) {
    return Get-Content -Raw -LiteralPath $signingConfigPath | ConvertFrom-Json
  }

  $password = New-Secret
  $config = [pscustomobject]@{
    keystorePath = $keystorePath
    keyAlias = $keyAlias
    storePassword = $password
    keyPassword = $password
    createdAt = (Get-Date).ToString('o')
  }

  if (Test-Path -LiteralPath $keystorePath) {
    Remove-Item -LiteralPath $keystorePath -Force
  }

  & $Keytool -genkeypair `
    -keystore $keystorePath `
    -storetype PKCS12 `
    -storepass $password `
    -keypass $password `
    -alias $keyAlias `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -dname 'CN=Pirepirapp Local Release, OU=Local, O=Pirepirapp, L=Asuncion, C=PY'

  if ($LASTEXITCODE -ne 0) {
    throw 'No se pudo generar la keystore local de release.'
  }

  $config | ConvertTo-Json | Set-Content -LiteralPath $signingConfigPath -Encoding utf8
  return $config
}

function Invoke-GradleBuild {
  param([string]$GradleHome)

  New-Item -ItemType Directory -Force -Path $GradleHome | Out-Null
  Push-Location $androidDir
  try {
    & .\gradlew.bat --gradle-user-home $GradleHome --no-daemon :app:assembleRelease 2>&1 | ForEach-Object { Write-Host $_ }
    $code = $LASTEXITCODE
    return $code
  } finally {
    Pop-Location
  }
}

$javaHome = Resolve-JavaHome
$env:JAVA_HOME = $javaHome
$env:Path = (Join-Path $javaHome 'bin') + ';' + $env:Path

$androidSdk = Resolve-AndroidSdk
$zipalign = Resolve-BuildTool -Sdk $androidSdk -Name 'zipalign.exe'
$apksigner = Resolve-BuildTool -Sdk $androidSdk -Name 'apksigner.bat'
$keytool = Join-Path $javaHome 'bin\keytool.exe'

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

$canRetryWithTemp = $exitCode -ne 0 -and -not $usingTempGradleHome -and -not $env:PIREPIRAPP_GRADLE_HOME
if ($canRetryWithTemp) {
  $tempGradleHome = Join-Path $env:TEMP ('pirepirapp-gradle-' + [guid]::NewGuid().ToString('N'))
  Write-Warning "Build con Gradle home $configuredGradleHome fallo; reintentando con Gradle home temporal: $tempGradleHome"
  $exitCode = Invoke-GradleBuild $tempGradleHome
}

if ($exitCode -ne 0) {
  exit $exitCode
}

if (-not (Test-Path -LiteralPath $unsignedApk)) {
  throw "No se encontro APK release unsigned en $unsignedApk"
}

$signing = Resolve-LocalSigning -Keytool $keytool

if (Test-Path -LiteralPath $alignedApk) {
  Remove-Item -LiteralPath $alignedApk -Force
}
if (Test-Path -LiteralPath $signedApk) {
  Remove-Item -LiteralPath $signedApk -Force
}
if (Test-Path -LiteralPath $signedApkIdsig) {
  Remove-Item -LiteralPath $signedApkIdsig -Force
}

& $zipalign -f -p 4 $unsignedApk $alignedApk
if ($LASTEXITCODE -ne 0) {
  throw 'zipalign fallo para el APK release local.'
}

& $apksigner sign `
  --ks $signing.keystorePath `
  --ks-key-alias $signing.keyAlias `
  --ks-pass "pass:$($signing.storePassword)" `
  --key-pass "pass:$($signing.keyPassword)" `
  --v4-signing-enabled false `
  --out $signedApk `
  $alignedApk
if ($LASTEXITCODE -ne 0) {
  throw 'apksigner fallo para el APK release local.'
}

& $apksigner verify --verbose $signedApk
if ($LASTEXITCODE -ne 0) {
  throw 'La verificacion de firma del APK release local fallo.'
}

Remove-Item -LiteralPath $alignedApk -Force
$artifact = Get-Item -LiteralPath $signedApk
Write-Host "ANDROID_RELEASE_LOCAL_SIGNED path=$($artifact.FullName) bytes=$($artifact.Length)"
