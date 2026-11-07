[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidatePattern('^[A-Za-z0-9][A-Za-z0-9._-]*$')]
    [string]$Name
)

$ErrorActionPreference = 'Stop'

$templateRoot = Split-Path -Parent $PSCommandPath
$systemsRoot  = Split-Path -Parent $templateRoot
$repoRoot     = Split-Path -Parent $systemsRoot

$systemDir = Join-Path $systemsRoot $Name
$linkRoot  = Join-Path $repoRoot '.opencode\agents\Systems'
$link      = Join-Path $linkRoot $Name

if (Test-Path $systemDir) {
    throw "A system named '$Name' already exists at $systemDir"
}

New-Item -ItemType Directory -Path $systemDir -Force | Out-Null

Copy-Item -Path (Join-Path $templateRoot '.opencode') -Destination $systemDir -Recurse -Force
Copy-Item -Path (Join-Path $templateRoot 'DESIGN.md') -Destination $systemDir -Force

$target = Join-Path $systemDir '.opencode\agents'

New-Item -ItemType Directory -Path $linkRoot -Force | Out-Null

if (Test-Path $link) {
    throw "A junction already exists at $link"
}

New-Item -ItemType Junction -Path $link -Target $target | Out-Null

Write-Host ""
Write-Host "Created system '$Name'" -ForegroundColor Green
Write-Host "  files      $systemDir"
Write-Host "  agents     $link"
Write-Host "          -> $target"
Write-Host ""
Write-Host "Agent IDs:"
foreach ($agent in 'coder', 'verifier', 'reviewer', 'explorer', 'tester') {
    Write-Host "  Systems/$Name/$agent"
}
Write-Host ""
Write-Host "Next: fill in $systemDir\DESIGN.md before writing any code."
