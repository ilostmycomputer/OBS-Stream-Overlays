$ErrorActionPreference = "Stop"

$bridgeDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue

if (-not $nodeCommand) {
    throw "Node.js was not found on PATH. Install Node.js 22 or newer, reopen PowerShell, and run npm ci first."
}

$node = $nodeCommand.Source
$healthScript = Join-Path $bridgeDir "health-check.mjs"
$port = 8765

if ($env:TYPING_OBS_PORT) {
    $parsedPort = 0
    if (-not [int]::TryParse($env:TYPING_OBS_PORT, [ref]$parsedPort) -or $parsedPort -lt 1 -or $parsedPort -gt 65535) {
        throw "TYPING_OBS_PORT must be an integer between 1 and 65535."
    }
    $port = $parsedPort
}

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

if (Get-Process -Name "obs64" -ErrorAction SilentlyContinue) {
    throw "OBS is already running. Close OBS before using this launcher, or start the bridge manually with npm start."
}

if (-not (Test-Path -LiteralPath (Join-Path $bridgeDir "node_modules\ws"))) {
    throw "The bridge dependency is missing. Open PowerShell in $bridgeDir and run npm ci first."
}

function Test-TypingBridge {
    & $node $healthScript *> $null
    return $LASTEXITCODE -eq 0
}

$bridgeProcess = $null

if (-not (Test-TypingBridge)) {
    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        throw "Port $port is already in use by another program. Close that program or follow the README port-change instructions."
    }

    $bridgeProcess = Start-Process -FilePath $node `
        -ArgumentList @("bridge.mjs") `
        -WorkingDirectory $bridgeDir `
        -WindowStyle Hidden `
        -PassThru

    $bridgeReady = $false
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        Start-Sleep -Milliseconds 250
        if (Test-TypingBridge) {
            $bridgeReady = $true
            break
        }
        if ($bridgeProcess.HasExited) {
            break
        }
    }

    if (-not $bridgeReady) {
        if (-not $bridgeProcess.HasExited) {
            Stop-Process -Id $bridgeProcess.Id
        }
        throw "The typing bridge did not start correctly. Run npm start in this folder to see the full error."
    }
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
