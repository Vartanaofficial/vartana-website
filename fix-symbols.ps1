$path = ".\app\page.tsx"
$backup = ".\app\page.tsx.backup-symbol-fix"

Copy-Item $path $backup -ErrorAction Stop
$content = [System.IO.File]::ReadAllText((Resolve-Path $path))

$replacements = [ordered]@{
    'Â·' = '·'
    'Â±' = '±'
    'â€“' = '–'
    'â€”' = '—'
    'Â°C' = '°C'
    'Ã—' = '×'
    'â†’' = '→'
    'â†—' = '↗'
    'â€¢' = '•'
    'âœ…' = '✓'
    'âœ“' = '✓'
    'âœ¨' = '✦'
    'âœ¦' = '✦'
    'Â©' = '©'
    'â€”' = '—'
}

foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
}

# Ganti ikon mojibake tertentu dengan ikon yang benar
$content = $content.Replace('ðŸ”¬', [char]::ConvertFromUtf32(0x1F52C))
$content = $content.Replace('ðŸ”¹', [char]::ConvertFromUtf32(0x1F539))
$content = $content.Replace('ðŸ“–', [char]::ConvertFromUtf32(0x1F4D6))
$content = $content.Replace('ðŸ›’', [char]::ConvertFromUtf32(0x1F6D2))
$content = $content.Replace('ðŸ”', [char]::ConvertFromUtf32(0x1F50D))
$content = $content.Replace('ðŸŽÂ', [char]::ConvertFromUtf32(0x1F381))
$content = $content.Replace('ðŸ’°', [char]::ConvertFromUtf32(0x1F4B0))
$content = $content.Replace('ðŸ’¬', [char]::ConvertFromUtf32(0x1F4AC))
$content = $content.Replace('ðŸ“‹', [char]::ConvertFromUtf32(0x1F4CB))
$content = $content.Replace('ðŸ”¡', [char]::ConvertFromUtf32(0x1F4A1))
$content = $content.Replace('Ã—', [char]::ConvertFromUtf32(0x00D7))

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $path), $content, $utf8)

Write-Host "Selesai. Backup tersimpan di $backup" -ForegroundColor Green
