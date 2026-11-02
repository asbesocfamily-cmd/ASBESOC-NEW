param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$results = [System.Collections.Generic.List[object]]::new()

function Add-Result([string]$Name, [string]$Status, [string]$Detail) {
  $script:results.Add([pscustomobject]@{ Name = $Name; Status = $Status; Detail = $Detail })
}

function Invoke-Check([string]$Name, [string]$WorkingDirectory, [string]$Executable, [string[]]$Arguments) {
  Write-Host "`n--- $Name ---"
  Push-Location $WorkingDirectory
  try {
    $output = & $Executable @Arguments 2>&1
    $exitCode = $LASTEXITCODE
    if ($output) { $output | ForEach-Object { Write-Host $_ } }
    if ($exitCode -eq 0) {
      Add-Result $Name 'PASS' "Exit code $exitCode"
    } else {
      Add-Result $Name 'FAIL' "Exit code $exitCode"
    }
  } catch {
    Add-Result $Name 'FAIL' $_.Exception.Message
    Write-Host "Command could not run: $($_.Exception.Message)"
  } finally {
    Pop-Location
  }
}

Write-Host 'ASBESOC dashboard and admin verification'
Write-Host "Repository: $repoRoot"
Write-Host 'No production services, payments, deployments, or configuration are changed.'

$functions = Join-Path $repoRoot 'functions'
$jsFiles = @(Get-ChildItem (Join-Path $functions 'src') -Filter '*.js' -File -Recurse)
if ($jsFiles.Count -eq 0) {
  Add-Result 'Backend JavaScript syntax' 'FAIL' 'No backend source files found.'
} else {
  $syntaxFailed = @()
  foreach ($file in $jsFiles) {
    & node --check $file.FullName 2>&1 | ForEach-Object { Write-Host $_ }
    if ($LASTEXITCODE -ne 0) { $syntaxFailed += $file.FullName }
  }
  if ($syntaxFailed.Count -eq 0) {
    Add-Result 'Backend JavaScript syntax' 'PASS' "$($jsFiles.Count) source files checked"
  } else {
    Add-Result 'Backend JavaScript syntax' 'FAIL' "Syntax errors in: $($syntaxFailed -join ', ')"
  }
}

Invoke-Check 'Backend unit tests' $functions 'npm.cmd' @('test', '--', '--test-reporter=spec')
if ($env:FIRESTORE_EMULATOR_HOST -match '^(127\.0\.0\.1|localhost):\d+$') {
  Invoke-Check 'Backend server integration tests' $functions 'npm.cmd' @('run', 'test:server')
} else {
  Add-Result 'Backend server integration tests' 'NEEDS MANUAL CHECK' 'Not run: this suite requires FIRESTORE_EMULATOR_HOST to point to a running local Firestore emulator.'
  Write-Host "`n--- Backend server integration tests ---"
  Write-Host 'NEEDS MANUAL CHECK: not run because no local Firestore emulator is configured.'
}
Invoke-Check 'Cloudflare Worker mocked tests' (Join-Path $repoRoot 'media-worker') 'node' @('--test', 'worker.test.mjs')
Invoke-Check 'Frontend lint' $repoRoot 'npm.cmd' @('run', 'lint', '--', '--no-warn-ignored')
if ($SkipBuild) {
  Add-Result 'Frontend production build' 'NOT RUN' 'Skipped by -SkipBuild.'
} else {
  Invoke-Check 'Frontend production build' $repoRoot 'npm.cmd' @('run', 'build')
}

Write-Host "`n--- Static configuration observations ---"
$workerPath = Join-Path $repoRoot 'media-worker/wrangler.jsonc'
$serviceConfig = Join-Path $functions 'payment-config.example.json'
$staticNotes = [System.Collections.Generic.List[string]]::new()
if ((Test-Path (Join-Path $repoRoot 'firestore.rules')) -and (Test-Path (Join-Path $repoRoot 'storage.rules'))) {
  $staticNotes.Add('Firestore and Storage rules files are present; runtime authorization still needs emulator or live tests.')
} else {
  $staticNotes.Add('Firestore or Storage rules file is missing.')
}
if ((Test-Path $workerPath) -and (Test-Path $serviceConfig)) {
  $staticNotes.Add('Cloudflare Worker and example payment config are present; deployed settings and secret bindings are unverified.')
} else {
  $staticNotes.Add('Cloudflare Worker config or payment config example is missing.')
}
$workerSource = Get-Content (Join-Path $repoRoot 'media-worker/worker.mjs') -Raw
$workerConfig = Get-Content $workerPath -Raw
if ($workerSource.Contains('env.FIREBASE_API_KEY') -and -not $workerConfig.Contains('FIREBASE_API_KEY')) {
  $staticNotes.Add('FIREBASE_API_KEY is intentionally not declared as a plaintext Wrangler variable; verify its Cloudflare secret binding before release.')
}
foreach ($note in $staticNotes) { Write-Host "NEEDS MANUAL CHECK: $note" }
Add-Result 'Firestore, Storage, deployment configuration' 'NEEDS MANUAL CHECK' ($staticNotes -join ' ')
Add-Result 'Member/admin flows and live payment behavior' 'NEEDS MANUAL CHECK' 'Requires emulator-backed workflow tests, authenticated accounts, or provider credentials; this script does not make payments.'
Add-Result 'Deployed website and release configuration' 'NEEDS MANUAL CHECK' 'Deployment access and production state are outside this local script.'

Write-Host "`n=== Verification summary ==="
$results | Format-Table -Wrap -AutoSize | Out-String -Width 220 | Write-Host
$failed = @($results | Where-Object Status -eq 'FAIL')
if ($failed.Count -gt 0) {
  Write-Host 'Overall machine-check status: FAIL. Review each failed command above.' -ForegroundColor Red
  exit 1
}
Write-Host 'Overall machine-check status: completed; manual checks remain as listed.' -ForegroundColor Yellow
exit 0
