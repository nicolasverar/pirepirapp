$root = Split-Path -Parent $PSScriptRoot
$icons = Join-Path $root 'frontend\icons'

if (-not (Test-Path $icons)) {
  New-Item -ItemType Directory -Path $icons | Out-Null
}

Add-Type -AssemblyName System.Drawing

function New-LcdIcon {
  param(
    [int]$Size,
    [string]$Path
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

  $case = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(32, 40, 32))
  $black = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(17, 23, 17))
  $lcd = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(174, 203, 124))
  $ink = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(25, 45, 24))
  $linePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(56, 86, 42), [Math]::Max(4, [int]($Size / 32)))

  $graphics.FillRectangle($case, 0, 0, $Size, $Size)

  $outer = [int]($Size * 0.12)
  $screenX = [int]($Size * 0.19)
  $screenY = [int]($Size * 0.21)
  $screenW = [int]($Size * 0.62)
  $screenH = [int]($Size * 0.45)

  $graphics.FillRectangle($black, $outer, [int]($Size * 0.14), $Size - ($outer * 2), [int]($Size * 0.62))
  $graphics.FillRectangle($lcd, $screenX, $screenY, $screenW, $screenH)
  $graphics.DrawRectangle($linePen, $screenX, $screenY, $screenW, $screenH)

  $unit = [int]($Size / 16)
  $graphics.FillRectangle($ink, [int]($Size * 0.28), [int]($Size * 0.55), [int]($Size * 0.44), $unit)
  $graphics.FillRectangle($ink, [int]($Size * 0.28), [int]($Size * 0.43), $unit * 2, $unit)
  $graphics.FillRectangle($ink, [int]($Size * 0.43), [int]($Size * 0.37), $unit * 2, $unit * 2)
  $graphics.FillRectangle($ink, [int]($Size * 0.58), [int]($Size * 0.31), $unit * 2, $unit * 3)
  $graphics.FillRectangle($lcd, [int]($Size * 0.19), [int]($Size * 0.79), [int]($Size * 0.62), [int]($Size * 0.09))
  $graphics.DrawRectangle([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(25, 45, 24), [Math]::Max(3, [int]($Size / 48))), [int]($Size * 0.19), [int]($Size * 0.79), [int]($Size * 0.62), [int]($Size * 0.09))

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-LcdIcon -Size 192 -Path (Join-Path $icons 'icon-192.png')
New-LcdIcon -Size 512 -Path (Join-Path $icons 'icon-512.png')
