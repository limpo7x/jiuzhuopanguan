param(
  [string]$Output = "docs/runtime/wechat-devtools-preview.png",
  [string]$TitlePattern = "jiuzhuopanguan",
  [ValidateSet("window", "right")]
  [string]$Mode = "right"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;

public class WechatDevtoolsCapture {
  [DllImport("user32.dll")]
  public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

  [DllImport("user32.dll")]
  public static extern bool PrintWindow(IntPtr hwnd, IntPtr hdcBlt, uint nFlags);

  [StructLayout(LayoutKind.Sequential)]
  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }
}
"@

$process = Get-Process |
  Where-Object {
    $_.ProcessName -eq "wechatdevtools" -and
    $_.MainWindowHandle -ne 0 -and
    $_.MainWindowTitle -like "*$TitlePattern*"
  } |
  Select-Object -First 1

if (-not $process) {
  throw "WeChat DevTools window not found. Title pattern: $TitlePattern"
}

$rect = New-Object WechatDevtoolsCapture+RECT
[void][WechatDevtoolsCapture]::GetWindowRect($process.MainWindowHandle, [ref]$rect)

$width = [Math]::Max(1, $rect.Right - $rect.Left)
$height = [Math]::Max(1, $rect.Bottom - $rect.Top)

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$hdc = $graphics.GetHdc()
$ok = [WechatDevtoolsCapture]::PrintWindow($process.MainWindowHandle, $hdc, 2)
$graphics.ReleaseHdc($hdc)
$graphics.Dispose()

if (-not $ok) {
  $bitmap.Dispose()
  throw "PrintWindow failed for WeChat DevTools window."
}

if ($Mode -eq "right") {
  $cropX = [int]($width * 0.62)
  $crop = New-Object System.Drawing.Rectangle $cropX, 0, ($width - $cropX), $height
  $cropped = $bitmap.Clone($crop, $bitmap.PixelFormat)
  $bitmap.Dispose()
  $bitmap = $cropped
  $width = $bitmap.Width
  $height = $bitmap.Height
}

$outputPath = if ([System.IO.Path]::IsPathRooted($Output)) {
  $Output
} else {
  Join-Path (Get-Location) $Output
}

New-Item -ItemType Directory -Force -Path (Split-Path $outputPath) | Out-Null
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()

[PSCustomObject]@{
  ok = $true
  mode = $Mode
  path = $outputPath
  width = $width
  height = $height
  title = $process.MainWindowTitle
} | ConvertTo-Json -Compress
