param(
  [string]$JavaHome = $env:JAVA_HOME,
  [string]$EmulatorCache = $env:FIREBASE_EMULATORS_PATH,
  [string]$ConfigHome = (Join-Path ([System.IO.Path]::GetTempPath()) 'asbesoc-emulator-config')
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$savedPath = $env:PATH
$savedJava = $env:JAVA_HOME
$savedCache = $env:FIREBASE_EMULATORS_PATH
$savedConfig = $env:XDG_CONFIG_HOME
try {
  if ($JavaHome) {
    if (-not (Test-Path -LiteralPath (Join-Path $JavaHome 'bin\java.exe'))) { throw 'JavaHome must contain bin\java.exe.' }
    $env:JAVA_HOME = $JavaHome
    $env:PATH = (Join-Path $JavaHome 'bin') + [System.IO.Path]::PathSeparator + $env:PATH
  }
  if (-not (Get-Command java -ErrorAction SilentlyContinue)) { throw 'Install Java 21+ or provide -JavaHome.' }
  if ($EmulatorCache) { $env:FIREBASE_EMULATORS_PATH = $EmulatorCache }
  $env:XDG_CONFIG_HOME = $ConfigHome
  Push-Location $projectRoot
  try {
    & firebase emulators:exec --project demo-asbesoc-membership --only firestore 'npm --prefix functions run test:emulator'
    if ($LASTEXITCODE -ne 0) { throw "Membership emulator checks failed (exit $LASTEXITCODE)." }
  } finally { Pop-Location }
} finally {
  $env:PATH = $savedPath
  $env:JAVA_HOME = $savedJava
  $env:FIREBASE_EMULATORS_PATH = $savedCache
  $env:XDG_CONFIG_HOME = $savedConfig
}
