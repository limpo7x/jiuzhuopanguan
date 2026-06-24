param(
  [int]$Port = 9420,
  [string]$ProjectPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [string]$CliPath = "D:\wechatkaifa\wechat_devtools_1.05.2204250_x64\cli.bat",
  [switch]$QuitExisting,
  [switch]$AllowPortFallback
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $CliPath)) {
  throw "WeChat DevTools CLI not found: $CliPath"
}

if (-not (Test-Path -LiteralPath $ProjectPath)) {
  throw "Project path not found: $ProjectPath"
}

if ($QuitExisting) {
  & $CliPath quit | Out-Null
  Start-Sleep -Seconds 3
}

$existing = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
  Where-Object { $_.State -eq "Listen" } |
  Select-Object -First 1

if ($existing) {
  [PSCustomObject]@{
    ok = $true
    action = "already-listening"
    port = $Port
    owningProcess = $existing.OwningProcess
    projectPath = $ProjectPath
  } | ConvertTo-Json -Compress
  exit 0
}

function Start-AutomationPort {
  param(
    [string[]]$Arguments,
    [string]$Mode
  )

  $process = Start-Process -FilePath $CliPath -ArgumentList $Arguments -PassThru -WindowStyle Hidden
  $deadline = (Get-Date).AddSeconds(45)
  do {
    Start-Sleep -Seconds 1
    $listener = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
      Where-Object { $_.State -eq "Listen" } |
      Select-Object -First 1
    if ($listener) {
      [PSCustomObject]@{
        ok = $true
        action = "started"
        mode = $Mode
        port = $Port
        cliPid = $process.Id
        owningProcess = $listener.OwningProcess
        projectPath = $ProjectPath
      } | ConvertTo-Json -Compress
      exit 0
    }
  } while ((Get-Date) -lt $deadline)
}

Start-AutomationPort -Mode "auto-port" -Arguments @(
  "auto",
  "--project", $ProjectPath,
  "--auto-port", [string]$Port,
  "--trust-project"
)

if ($AllowPortFallback) {
  Start-AutomationPort -Mode "port-fallback" -Arguments @(
    "auto",
    "--project", $ProjectPath,
    "--port", [string]$Port,
    "--trust-project"
  )
}

throw "Timed out waiting for WeChat DevTools automation port $Port."
