# Uploads the site to GitHub through the Contents API (no local git needed).
# Usage: powershell -File tools/upload-site.ps1 -Source <site folder> -Repo owner/name
# Skips node_modules/ and build/, skips files whose content is already in the repository
# (compares the Git blob SHA), and retries each request to ride out proxy hiccups.
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [Parameter(Mandatory = $true)][string]$Repo
)

$gh = Join-Path $env:LOCALAPPDATA "Programs\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) { $gh = "gh" }
$tmp = Join-Path $env:TEMP "gh-upload-body.json"
$root = (Resolve-Path $Source).Path

function Get-BlobSha([byte[]]$bytes) {
  $header = [System.Text.Encoding]::ASCII.GetBytes("blob $($bytes.Length)`0")
  $sha1 = [System.Security.Cryptography.SHA1]::Create()
  $hash = $sha1.ComputeHash($header + $bytes)
  return (($hash | ForEach-Object { $_.ToString("x2") }) -join "")
}

function Invoke-Gh([string[]]$ghArgs) {
  for ($attempt = 1; $attempt -le 4; $attempt++) {
    $out = & $gh @ghArgs 2>&1
    if ($LASTEXITCODE -eq 0) { return ,@($true, ($out | Out-String).Trim()) }
    $text = ($out | Out-String)
    if ($text -match 'HTTP 404') { return ,@($false, 'missing') }
    Start-Sleep -Seconds (2 * $attempt)
  }
  return ,@($false, ($out | Out-String).Trim())
}

$files = Get-ChildItem -Path $root -Recurse -File -Force |
  Where-Object { $_.FullName -notmatch '\\(node_modules|build)\\' -and $_.Name -ne 'package-lock.json' } |
  Sort-Object FullName

$uploaded = 0; $skipped = 0
foreach ($f in $files) {
  $rel = $f.FullName.Substring($root.Length + 1) -replace '\\', '/'
  $apiPath = ($rel -split '/' | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/'
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  $localSha = Get-BlobSha $bytes

  $probe = Invoke-Gh @("api", "repos/$Repo/contents/$apiPath", "--jq", ".sha")
  $existing = if ($probe[0]) { $probe[1] } else { $null }
  if ($existing -eq $localSha) { Write-Output "SKIP $rel (unchanged)"; $skipped++; continue }

  $body = @{ message = "Add $rel"; content = [Convert]::ToBase64String($bytes) }
  if ($existing) { $body.sha = $existing; $body.message = "Update $rel" }
  ($body | ConvertTo-Json -Compress) | Out-File -FilePath $tmp -Encoding ascii -NoNewline

  $put = Invoke-Gh @("api", "--method", "PUT", "repos/$Repo/contents/$apiPath", "--input", $tmp, "--jq", ".commit.sha")
  if ($put[0]) { Write-Output "OK   $rel  ($($bytes.Length) bytes)  $($put[1])"; $uploaded++ }
  else { Write-Output "FAIL $rel  $($put[1])"; exit 1 }
}
Remove-Item $tmp -Force -ErrorAction SilentlyContinue
Write-Output "$uploaded uploaded, $skipped unchanged, repository $Repo."
