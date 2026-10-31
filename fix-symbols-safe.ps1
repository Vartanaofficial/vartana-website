$path = ".\app\page.tsx"
$backup = ".\app\page.tsx.backup-symbol-fix"

if (!(Test-Path $path)) {
    throw "File app/page.tsx tidak ditemukan."
}

if (!(Test-Path $backup)) {
    Copy-Item $path $backup
}

$content = [System.IO.File]::ReadAllText((Resolve-Path $path))

# Perbaikan simbol umum menggunakan Unicode escape
$replacements = @{
    ([string][char]0x00C2 + [char]0x00B7) = [string][char]0x00B7
    ([string][char]0x00C2 + [char]0x00B0 + "C") = [string][char]0x00B0 + "C"
    ([string][char]0x00C3 + [char]0x0097) = [string][char]0x00D7
}

foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
}

# Simpan sebagai UTF-8 tanpa BOM
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $path), $content, $utf8)

Write-Host "Perbaikan simbol selesai. Backup awal: $backup" -ForegroundColor Green
