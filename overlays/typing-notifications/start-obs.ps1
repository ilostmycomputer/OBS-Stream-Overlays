$ErrorActionPreference = "Stop"

$bridgeDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue

if (-not $nodeCommand) {
    throw "Node.js was not found on PATH. Install Node.js, reopen PowerShell, and run npm install first."
}

$node = $nodeCommand.Source
$obsCandidates = @()

if ($env:OBS_PATH) {
    $obsCandidates += $env:OBS_PATH
}

if ($env:ProgramFiles) {
    $obsCandidates += Join-Path $env:ProgramFiles "obs-studio\bin\64bit\obs64.exe"
}

if (${env:ProgramFiles(x86)}) {
    $obsCandidates += Join-Path ${env:ProgramFiles(x86)} "obs-studio\bin\64bit\obs64.exe"
}

if ($env:LOCALAPPDATA) {
    $obsCandidates += Join-Path $env:LOCALAPPDATA "Programs\obs-studio\bin\64bit\obs64.exe"
}

$obs = $obsCandidates |
    Where-Object { Test-Path -LiteralPath $_ } |
    Select-Object -First 1

if (-not $obs) {
    throw "OBS was not found. Set OBS_PATH to the full path of obs64.exe and try again."
}

if (-not (Test-Path -LiteralPath (Join-Path $bridgeDir "node_modules\ws"))) {
    throw "The bridge dependency is missing. Run npm install in $bridgeDir first."
}

$bridgeProcess = $null

if (-not (Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue)) {
    $bridgeProcess = Start-Process -FilePath $node `
        -ArgumentList @("bridge.mjs") `
        -WorkingDirectory $bridgeDir `
        -WindowStyle Hidden `
        -PassThru
}

$obsDir = Split-Path -Parent $obs
$obsProcess = Start-Process -FilePath $obs -WorkingDirectory $obsDir -PassThru

try {
    Wait-Process -Id $obsProcess.Id
}
finally {
    if ($bridgeProcess -and -not $bridgeProcess.HasExited) {
        Stop-Process -Id $bridgeProcess.Id
    }
}

