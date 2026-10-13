param([switch]$Run)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $Run) {
  Write-Output 'Deploy the approved Firebase backend/rules, then publish through GitHub Pages. Payments remain disabled. Run with -Run after Firebase and GitHub sign-in are available.'
  exit 0
}
Push-Location $projectRoot
try {
  $env:XDG_CONFIG_HOME = Join-Path $projectRoot 'work/firebase-deploy-config'
  & firebase projects:list --json
  if ($LASTEXITCODE -ne 0) { throw 'Firebase sign-in or project access is unavailable.' }
  & git -c http.sslBackend=openssl push --dry-run origin HEAD:main
  if ($LASTEXITCODE -ne 0) { throw 'GitHub push access is unavailable. Nothing deployed.' }
  & npm run build
  if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
  & npm run lint
  if ($LASTEXITCODE -ne 0) { throw 'Lint failed.' }
  & firebase deploy --project asbesoc-nigeria --only firestore,storage,functions --non-interactive
  if ($LASTEXITCODE -ne 0) { throw 'Firebase deployment did not complete. Inspect its output before continuing; website was not pushed.' }
  Write-Output 'Firebase deployment completed. Commit the reviewed source changes and push main to publish GitHub Pages; do not stage work/ or credentials.'
} finally {
  Pop-Location
}
