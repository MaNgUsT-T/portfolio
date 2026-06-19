[CmdletBinding()]
param(
  [ValidateSet(
    "proxy-up",
    "proxy-check",
    "proxy-ensure",
    "proxy-dynamic-perms",
    "proxy-down",
    "up",
    "down",
    "build",
    "start",
    "stop",
    "logs",
    "image-clean",
    "pull-prebuilt",
    "php-image-current",
    "build-php",
    "recreate-php",
    "up-all",
    "up-all-build",
    "down-all",
    "restart-all",
    "rebuild-all",
    "db-import-init-dump",
    "db-pull-init",
    "db-pull",
    "db-import",
    "db-reset",
    "db-reset-from-live",
    "check-versions"
  )]
  [string]$Target = "proxy-up"
)

$ErrorActionPreference = "Stop"
if ($PSVersionTable.PSVersion.Major -ge 7) {
  $PSNativeCommandUseErrorActionPreference = $false
}

$dockerDir = $PSScriptRoot
$repoRoot = Split-Path $dockerDir -Parent
$envFile = Join-Path $dockerDir ".env"
$composeFile = "docker-compose.yml"
$proxyComposeFile = "proxy/traefik/docker-compose.yml"
$proxyServices = @("traefik")

if (-not (Test-Path $envFile)) {
  throw ".env fehlt. Kopiere _docker/.env.example nach _docker/.env und fuelle die Werte aus."
}

function Strip-EnvInlineComment {
  param([string]$Value)

  $inSingle = $false
  $inDouble = $false
  $sb = New-Object System.Text.StringBuilder
  foreach ($ch in $Value.ToCharArray()) {
    if ($ch -eq "'" -and -not $inDouble) { $inSingle = -not $inSingle }
    if ($ch -eq '"' -and -not $inSingle) { $inDouble = -not $inDouble }
    if ($ch -eq '#' -and -not $inSingle -and -not $inDouble) { break }
    [void]$sb.Append($ch)
  }
  return $sb.ToString()
}

function Read-EnvFile {
  param([string]$Path)

  $map = @{}
  if (-not (Test-Path $Path)) { return $map }
  $content = Get-Content -Raw -Path $Path
  if ([string]::IsNullOrWhiteSpace($content)) { return $map }

  foreach ($line in ($content -split "\r?\n")) {
    $trim = $line.Trim()
    if (-not $trim) { continue }
    if ($trim.StartsWith("#")) { continue }
    if ($trim.StartsWith("export ")) { $trim = $trim.Substring(7).Trim() }

    $eq = $trim.IndexOf("=")
    if ($eq -lt 1) { continue }

    $key = $trim.Substring(0, $eq).Trim()
    if (-not $key) { continue }

    $val = $trim.Substring($eq + 1)
    $val = Strip-EnvInlineComment $val
    $val = $val.Trim()
    if ($val.Length -ge 2) {
      if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
        $val = $val.Substring(1, $val.Length - 2)
      }
    }
    $map[$key] = $val
  }

  return $map
}

function Get-EnvValueFromMap {
  param([hashtable]$Map, [string]$Key)

  if ($Map.ContainsKey($Key)) {
    $val = $Map[$Key]
    if ($null -ne $val -and $val -ne "") { return $val }
  }
  return $null
}

function Get-Cfg {
  param([string]$Key)
  return Get-EnvValueFromMap $envData $Key
}

function Set-EnvIfPresent {
  param([string]$Key, [string]$Value)

  if ($null -ne $Value -and $Value -ne "") {
    Set-Item -Path ("Env:" + $Key) -Value $Value
  }
}

function Assert-ConfigSet {
  param([string[]]$Keys)

  $missing = @()
  foreach ($k in $Keys) {
    if (-not (Get-Cfg $k)) { $missing += $k }
  }

  if ($missing.Count -gt 0) {
    throw "Fehlende Pflicht-Konfigurationsvariablen. In _docker/.env setzen: $($missing -join ', ')"
  }
}

function Get-Sha256Hex {
  param([string]$Value)

  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $hash = $sha.ComputeHash($bytes)
  } finally {
    $sha.Dispose()
  }

  return ([System.BitConverter]::ToString($hash) -replace "-", "").ToLowerInvariant()
}

function Quote-WinArgument {
  param([string]$Arg)

  if ($null -eq $Arg) { return '""' }
  if ($Arg -notmatch '[\s"]') { return $Arg }

  $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append('"')
  $backslashes = 0

  foreach ($ch in $Arg.ToCharArray()) {
    if ($ch -eq '\\') {
      $backslashes++
      continue
    }

    if ($ch -eq '"') {
      if ($backslashes -gt 0) {
        [void]$sb.Append('\\'.PadLeft($backslashes * 2, '\\'))
        $backslashes = 0
      }
      [void]$sb.Append('\\"')
      continue
    }

    if ($backslashes -gt 0) {
      [void]$sb.Append('\\'.PadLeft($backslashes, '\\'))
      $backslashes = 0
    }
    [void]$sb.Append($ch)
  }

  if ($backslashes -gt 0) {
    [void]$sb.Append('\\'.PadLeft($backslashes * 2, '\\'))
  }
  [void]$sb.Append('"')
  return $sb.ToString()
}

function Test-DockerImageExists {
  param([string]$ImageTag)

  if (-not $ImageTag) { return $false }
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    docker image inspect $ImageTag 2>$null | Out-Null
    return ($LASTEXITCODE -eq 0)
  } finally {
    $ErrorActionPreference = $prevEap
  }
}

function Get-ImageBuildSignature {
  param([string]$ImageTag)

  if (-not (Test-DockerImageExists $ImageTag)) { return $null }
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $value = docker image inspect $ImageTag --format '{{ index .Config.Labels "dev.wp.image-build-signature" }}' 2>$null | Select-Object -First 1
    if ($LASTEXITCODE -ne 0) { return $null }
    if ($null -eq $value) { return $null }

    $trimmed = ([string]$value).Trim()
    if ([string]::IsNullOrWhiteSpace($trimmed)) { return $null }
    return $trimmed
  } finally {
    $ErrorActionPreference = $prevEap
  }
}

function Get-ProxyImage {
  param([string]$Path)

  if (-not (Test-Path $Path)) { return $null }

  foreach ($line in Get-Content -Path $Path) {
    $trim = $line.Trim()
    if (-not $trim) { continue }
    if ($trim.StartsWith("#")) { continue }

    if ($trim -match '^\s*image\s*:\s*(.+)$') {
      $val = $Matches[1]
      $val = Strip-EnvInlineComment $val
      $val = $val.Trim()
      if ($val.Length -ge 2) {
        if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
          $val = $val.Substring(1, $val.Length - 2)
        }
      }
      if ($val) { return $val }
    }
  }

  return $null
}

function Ensure-DevProxyNetwork {
  if (-not ((docker network ls --format "{{.Name}}") -contains "dev-proxy")) {
    docker network create dev-proxy | Out-Null
  }
}

function Has-InitDump {
  $initDir = Join-Path $dockerDir "db\init"
  if (-not (Test-Path $initDir)) { return $false }

  $sql = @(Get-ChildItem -Path $initDir -Filter *.sql -ErrorAction SilentlyContinue).Count
  $sqlGz = @(Get-ChildItem -Path $initDir -Filter *.sql.gz -ErrorAction SilentlyContinue).Count
  return ($sql + $sqlGz) -gt 0
}

function Test-DbVolumeExists {
  $volumeName = "${projectName}_db_data"
  return ((docker volume ls --format "{{.Name}}") -contains $volumeName)
}

function Invoke-Compose {
  param([string[]]$ComposeArgs, [switch]$AllowFailure)

  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    & $composeCmd @($composeSub + $ComposeArgs)
  } catch {
    throw "Aufruf von docker compose fehlgeschlagen: $($_.Exception.Message)"
  } finally {
    $ErrorActionPreference = $prevEap
  }

  $exit = $LASTEXITCODE
  if (-not $AllowFailure -and $exit -ne 0) {
    throw "docker compose fehlgeschlagen (Rueckgabecode $exit): $($ComposeArgs -join ' ')"
  }
  return $exit
}

function Invoke-ComposeBuild {
  param([string[]]$ComposeArgs)

  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $output = $null
  try {
    $output = & $composeCmd @($composeSub + $ComposeArgs) 2>&1
  } catch {
    throw "Aufruf von docker compose fehlgeschlagen: $($_.Exception.Message)"
  } finally {
    $ErrorActionPreference = $prevEap
  }

  if ($output) {
    foreach ($line in $output) {
      $text = [string]$line
      if ($text -match '^\s*#\d+\s') { continue }
      Write-Host $text
    }
  }

  if ($LASTEXITCODE -ne 0) {
    throw "docker compose fehlgeschlagen (Rueckgabecode $LASTEXITCODE): $($ComposeArgs -join ' ')"
  }
}

function Invoke-ProxyDynamicPerms {
  $proxyRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "^dev-proxy_traefik$"
  if (-not $proxyRunning) { return }

  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $exit = 1
  try {
    docker exec dev-proxy_traefik sh -lc "mkdir -p /etc/traefik/dynamic && chown ${hostUid}:${hostGid} /etc/traefik/dynamic && chmod 775 /etc/traefik/dynamic" | Out-Null
    $exit = $LASTEXITCODE
  } catch {
    $exit = 1
  } finally {
    $ErrorActionPreference = $prevEap
  }

  if ($exit -eq 0) {
    Write-Host "[INFO] Rechte fuer /etc/traefik/dynamic auf UID/GID $hostUid`:$hostGid gesetzt."
  } else {
    Write-Host "[WARN] Konnte Rechte auf /etc/traefik/dynamic nicht setzen."
  }
}

function Invoke-CheckVersions {
  $missing = @()
  if (-not $phpImage) { $missing += "PHP_IMAGE" }
  if (-not $phpVersion) { $missing += "PHP_VERSION" }
  if (-not $wpCliVersion) { $missing += "WP_CLI_VERSION" }
  if (-not $dbVersion) { $missing += "DB_VERSION" }
  if (-not $apacheVersion) { $missing += "APACHE_VERSION" }
  if (-not $phpmyadminVersion) { $missing += "PHPMYADMIN_VERSION" }
  if (-not $mailhogVersion) { $missing += "MAILHOG_VERSION" }
  if (-not $hostUid) { $missing += "HOST_UID" }
  if (-not $hostGid) { $missing += "HOST_GID" }

  if ($missing.Count -gt 0) {
    throw "Fehlende Pflicht-Variablen. In _docker/.env setzen:`n  $($missing -join ', ')"
  }
}

function Invoke-ProxyUp {
  Ensure-DevProxyNetwork

  $proxyImage = Get-ProxyImage -Path $proxyComposeFile
  if ($pull -eq "1") {
    Write-Host "[INFO] Lade Proxy-Image(s): $($proxyServices -join ' ')"
    Invoke-Compose (@("-f", $proxyComposeFile, "pull") + $proxyServices) | Out-Null
  } elseif (-not (Test-DockerImageExists $proxyImage)) {
    Write-Host "[INFO] Lade fehlende Proxy-Image(s): $($proxyServices -join ' ')"
    Invoke-Compose (@("-f", $proxyComposeFile, "pull") + $proxyServices) | Out-Null
  }

  Invoke-Compose @("-f", $proxyComposeFile, "up", "-d") | Out-Null
}

function Invoke-ProxyCheck {
  $proxyRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "^dev-proxy_traefik$"
  if (-not $proxyRunning) {
    throw "Traefik ist Pflicht: Container dev-proxy_traefik laeuft nicht."
  }
}

function Invoke-ProxyEnsure {
  $proxyExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "^dev-proxy_traefik$"
  if ($proxyExists) {
    Write-Host "[INFO] Traefik-Container existiert. Starte proxy-check..."
    Invoke-ProxyCheck
    Invoke-ProxyDynamicPerms
    Write-Host "[INFO] Traefik-Container laeuft. Starte naechsten Schritt..."
    return
  }

  Write-Host "[INFO] Traefik-Container fehlt. Starte proxy-up..."
  Invoke-ProxyUp
  Write-Host "[INFO] Proxy-Start abgeschlossen. Starte proxy-check..."
  Invoke-ProxyCheck
  Invoke-ProxyDynamicPerms
  Write-Host "[INFO] Traefik-Container laeuft. Starte naechsten Schritt..."
}

function Invoke-PullPrebuilt {
  $prebuilt = @(
    @{ Service = "db"; Image = "mariadb:$dbVersion" },
    @{ Service = "apache"; Image = "httpd:$apacheVersion" },
    @{ Service = "phpmyadmin"; Image = "phpmyadmin:$phpmyadminVersion" },
    @{ Service = "mailhog"; Image = "mailhog/mailhog:$mailhogVersion" }
  )

  if ($pull -eq "1") {
    Write-Host "[INFO] Lade vorgebaute Images: db apache phpmyadmin mailhog"
    Invoke-Compose @("-f", $composeFile, "pull", "db", "apache", "phpmyadmin", "mailhog") | Out-Null
    return
  }

  $missing = @()
  foreach ($item in $prebuilt) {
    if (-not (Test-DockerImageExists $item.Image)) { $missing += $item.Service }
  }

  if ($missing.Count -gt 0) {
    Write-Host "[INFO] Lade fehlende vorgebaute Images: $($missing -join ' ')"
    Invoke-Compose ((@("-f", $composeFile, "pull") + $missing)) | Out-Null
  }
}

function Test-PhpImageCurrent {
  param([switch]$Quiet)

  $currentSignature = Get-ImageBuildSignature $phpImageTag
  if ($currentSignature -and $currentSignature -eq $imageBuildSignature) {
    if (-not $Quiet) { Write-Host "[INFO] PHP-Image aktuell: $phpImageTag" }
    return $true
  }

  if (-not $Quiet) { Write-Host "[INFO] PHP-Image veraltet oder fehlt: $phpImageTag" }
  return $false
}

function Invoke-BuildPhp {
  $buildArgs = @("-f", $composeFile, "build")
  if ($pull -eq "1") { $buildArgs += "--pull" }
  $buildArgs += "php"

  if ($forcePhpBuild -eq "1") {
    Write-Host "[INFO] Erzwinge Build des PHP-Images"
    Invoke-ComposeBuild $buildArgs
    return
  }

  if (Test-PhpImageCurrent -Quiet) {
    Write-Host "[INFO] PHP-Image $phpImageTag existiert bereits; Build wird uebersprungen."
    return
  }

  Write-Host "[INFO] PHP-Image veraltet oder fehlt. Build wird gestartet: $phpImageTag"
  Invoke-ComposeBuild $buildArgs
}

function Invoke-RecreatePhp {
  if ($recreatePhp -ne "1") { return }

  $ctn = "${projectName}_php"
  $curId = docker inspect -f "{{.Image}}" $ctn 2>$null | Select-Object -First 1
  if ($LASTEXITCODE -ne 0) { return }

  $newId = docker image inspect -f "{{.Id}}" $phpImageTag 2>$null | Select-Object -First 1
  if ($LASTEXITCODE -ne 0) { return }

  if ($newId -and $curId -ne $newId) {
    Write-Host "[INFO] Erstelle php-Container neu, um das neueste Image zu verwenden"
    Invoke-Compose @("-f", $composeFile, "up", "-d", "--force-recreate", "--no-deps", "php") | Out-Null
  }
}

function Invoke-ImageClean {
  if ($cleanImages -ne "1") { return }

  Write-Host "[INFO] Bereinige ungenutzte Images"
  docker image prune -f | Out-Null

  if ($cleanBaseImage -eq "1" -and $phpVersion) {
    $base = "php:$phpVersion-fpm"
    if (Test-DockerImageExists $base) {
      Write-Host "[INFO] Entferne Basis-Image $base"
      docker rmi $base 2>$null | Out-Null
    }
  }
}

function Show-AccessInfo {
  if ($phpmyadminHost) {
    Write-Host "[INFO] phpMyAdmin: http://$phpmyadminHost"
  }
  if ($mailhogHost) {
    Write-Host "[INFO] MailHog: http://$mailhogHost"
  }

  if (-not $localUrl) { return }

  $curlExe = Get-Command curl.exe -ErrorAction SilentlyContinue
  if ($curlExe) {
    $code = & $curlExe.Source -s -o /dev/null -w '%{http_code}' $localUrl
    if ($LASTEXITCODE -eq 0 -and $code) {
      Write-Host "[CHECK] HTTP-Status ${localUrl}: $code"
      return
    }
  }

  Write-Host "[INFO] 'curl' nicht gefunden. Manuell pruefen: $localUrl"
}

function Invoke-BashScript {
  param([string[]]$Args, [switch]$AllowFailure)

  $bash = Get-Command bash -ErrorAction SilentlyContinue
  if (-not $bash) {
    throw "bash nicht im PATH gefunden."
  }

  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    & $bash.Source @Args
  } finally {
    $ErrorActionPreference = $prevEap
  }

  $exit = $LASTEXITCODE
  if (-not $AllowFailure -and $exit -ne 0) {
    throw "bash fehlgeschlagen (Rueckgabecode $exit): $($Args -join ' ')"
  }

  return $exit
}

function Invoke-DbImportFromGzip {
  param(
    [string]$DumpPath,
    [string]$MissingFileMessage
  )

  if (-not (Test-Path $DumpPath)) {
    throw $MissingFileMessage
  }

  $allArgs = @() + $composeSub + @(
    "-f", $composeFile,
    "exec", "-T", "db", "sh", "-c",
    'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u"$MYSQL_USER" "$MYSQL_DATABASE"'
  )

  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $composeCmd
  $psi.UseShellExecute = $false
  $psi.RedirectStandardInput = $true

  if ($psi.PSObject.Properties.Name -contains "ArgumentList") {
    foreach ($a in $allArgs) { [void]$psi.ArgumentList.Add($a) }
  } else {
    $psi.Arguments = ($allArgs | ForEach-Object { Quote-WinArgument $_ }) -join ' '
  }

  $proc = New-Object System.Diagnostics.Process
  $proc.StartInfo = $psi
  $proc.Start() | Out-Null

  $file = [System.IO.File]::OpenRead($DumpPath)
  try {
    $gzip = New-Object System.IO.Compression.GZipStream($file, [System.IO.Compression.CompressionMode]::Decompress)
    try {
      $gzip.CopyTo($proc.StandardInput.BaseStream)
    } finally {
      $gzip.Dispose()
    }
  } finally {
    $file.Dispose()
    $proc.StandardInput.Close()
  }

  $proc.WaitForExit()
  if ($proc.ExitCode -ne 0) {
    throw "DB-Import fehlgeschlagen (Rueckgabecode $($proc.ExitCode))."
  }
}

$envData = Read-EnvFile $envFile

$projectName = Get-Cfg "PROJECT_NAME"
$phpImage = Get-Cfg "PHP_IMAGE"
$phpVersion = Get-Cfg "PHP_VERSION"
$mailhogVersion = Get-Cfg "MAILHOG_VERSION"
$wpCliVersion = Get-Cfg "WP_CLI_VERSION"
$dbVersion = Get-Cfg "DB_VERSION"
$apacheVersion = Get-Cfg "APACHE_VERSION"
$phpmyadminVersion = Get-Cfg "PHPMYADMIN_VERSION"
$hostUid = Get-Cfg "HOST_UID"
$hostGid = Get-Cfg "HOST_GID"

$liveUrl = Get-Cfg "LIVE_URL"
$localUrl = Get-Cfg "LOCAL_URL"
$livePath = Get-Cfg "LIVE_PATH"
$localPath = Get-Cfg "LOCAL_PATH"
$virtualHost = Get-Cfg "VIRTUAL_HOST"
$phpmyadminHost = Get-Cfg "PHPMYADMIN_HOST"
$mailhogHost = Get-Cfg "MAILHOG_HOST"
if (-not $mailhogHost -and $virtualHost) { $mailhogHost = "mailhog.$virtualHost" }

$mysqlDatabase = Get-Cfg "MYSQL_DATABASE"
$mysqlUser = Get-Cfg "MYSQL_USER"
$mysqlPassword = Get-Cfg "MYSQL_PASSWORD"
$remoteDbName = Get-Cfg "REMOTE_DB_NAME"
$remoteDbUser = Get-Cfg "REMOTE_DB_USER"
$remoteDbPassword = Get-Cfg "REMOTE_DB_PASSWORD"

if (-not $mysqlDatabase -and $remoteDbName) { $mysqlDatabase = $remoteDbName }
if (-not $mysqlUser -and $remoteDbUser) { $mysqlUser = $remoteDbUser }
if (-not $mysqlPassword -and $remoteDbPassword) { $mysqlPassword = $remoteDbPassword }

$cleanImages = Get-Cfg "CLEAN_IMAGES"
if (-not $cleanImages) { $cleanImages = $env:CLEAN_IMAGES }
if (-not $cleanImages) { $cleanImages = "1" }

$cleanBaseImage = Get-Cfg "CLEAN_BASE_IMAGE"
if (-not $cleanBaseImage) { $cleanBaseImage = $env:CLEAN_BASE_IMAGE }
if (-not $cleanBaseImage) { $cleanBaseImage = "1" }

$pull = Get-Cfg "PULL"
if (-not $pull) { $pull = $env:PULL }
if (-not $pull) { $pull = "0" }

$forcePhpBuild = Get-Cfg "FORCE_PHP_BUILD"
if (-not $forcePhpBuild) { $forcePhpBuild = $env:FORCE_PHP_BUILD }
if (-not $forcePhpBuild) { $forcePhpBuild = "0" }

$recreatePhp = Get-Cfg "RECREATE_PHP"
if (-not $recreatePhp) { $recreatePhp = $env:RECREATE_PHP }
if (-not $recreatePhp) { $recreatePhp = "1" }

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "docker nicht im PATH gefunden."
}

$composeCmd = "docker"
$composeSub = @("compose")
$composeOk = $false
try {
  & $composeCmd @($composeSub + @("version")) *>$null
  if ($LASTEXITCODE -eq 0) { $composeOk = $true }
} catch {
  $composeOk = $false
}

if (-not $composeOk) {
  if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    $composeCmd = "docker-compose"
    $composeSub = @()
  } else {
    throw "Weder 'docker compose' noch 'docker-compose' gefunden. Bitte Docker Compose installieren."
  }
}

$phpDockerfilePath = Join-Path $dockerDir "php\Dockerfile"
if (-not (Test-Path $phpDockerfilePath)) {
  throw "php/Dockerfile nicht gefunden."
}

$imageBuildSignature = $env:IMAGE_BUILD_SIGNATURE
if (-not $imageBuildSignature) {
  $dockerfileHash = (Get-FileHash -Algorithm SHA256 -Path $phpDockerfilePath).Hash.ToLowerInvariant()
  $payload = "Dockerfile=$dockerfileHash|HOST_UID=$hostUid|HOST_GID=$hostGid|PHP_VERSION=$phpVersion|WP_CLI_VERSION=$wpCliVersion"
  $imageBuildSignature = Get-Sha256Hex $payload
}

$phpImageTag = "${phpImage}:$phpVersion"

Set-EnvIfPresent "PROJECT_NAME" $projectName
Set-EnvIfPresent "PHP_IMAGE" $phpImage
Set-EnvIfPresent "PHP_VERSION" $phpVersion
Set-EnvIfPresent "MAILHOG_VERSION" $mailhogVersion
Set-EnvIfPresent "WP_CLI_VERSION" $wpCliVersion
Set-EnvIfPresent "DB_VERSION" $dbVersion
Set-EnvIfPresent "APACHE_VERSION" $apacheVersion
Set-EnvIfPresent "PHPMYADMIN_VERSION" $phpmyadminVersion
Set-EnvIfPresent "HOST_UID" $hostUid
Set-EnvIfPresent "HOST_GID" $hostGid
Set-EnvIfPresent "IMAGE_BUILD_SIGNATURE" $imageBuildSignature
Set-EnvIfPresent "LIVE_URL" $liveUrl
Set-EnvIfPresent "LOCAL_URL" $localUrl
Set-EnvIfPresent "LIVE_PATH" $livePath
Set-EnvIfPresent "LOCAL_PATH" $localPath
Set-EnvIfPresent "VIRTUAL_HOST" $virtualHost
Set-EnvIfPresent "PHPMYADMIN_HOST" $phpmyadminHost
Set-EnvIfPresent "MAILHOG_HOST" $mailhogHost
Set-EnvIfPresent "MYSQL_DATABASE" $mysqlDatabase
Set-EnvIfPresent "MYSQL_USER" $mysqlUser
Set-EnvIfPresent "MYSQL_PASSWORD" $mysqlPassword
Set-EnvIfPresent "CLEAN_IMAGES" $cleanImages
Set-EnvIfPresent "CLEAN_BASE_IMAGE" $cleanBaseImage
Set-EnvIfPresent "FORCE_PHP_BUILD" $forcePhpBuild
Set-EnvIfPresent "PULL" $pull
Set-EnvIfPresent "RECREATE_PHP" $recreatePhp

Push-Location $dockerDir
try {
  switch ($Target) {
    "proxy-up" {
      Invoke-ProxyUp
      break
    }
    "proxy-check" {
      Invoke-ProxyCheck
      break
    }
    "proxy-ensure" {
      Invoke-ProxyEnsure
      break
    }
    "proxy-dynamic-perms" {
      Invoke-ProxyDynamicPerms
      break
    }
    "proxy-down" {
      Invoke-Compose @("-f", $proxyComposeFile, "down") -AllowFailure | Out-Null
      break
    }
    "up" {
      Invoke-ProxyCheck
      Invoke-CheckVersions
      Invoke-PullPrebuilt
      Invoke-BuildPhp
      Invoke-Compose @("-f", $composeFile, "up", "-d") | Out-Null
      Invoke-RecreatePhp
      Invoke-ImageClean
      if ($localUrl) {
        Write-Host "[OK] Docker-Stack gebaut & gestartet. URL: $localUrl"
      } else {
        Write-Host "[OK] Docker-Stack gebaut & gestartet."
      }
      Show-AccessInfo
      break
    }
    "down" {
      Invoke-Compose @("-f", $composeFile, "down") | Out-Null
      break
    }
    "build" {
      $args = @("-f", $composeFile, "build")
      if ($pull -eq "1") { $args += "--pull" }
      Invoke-Compose $args | Out-Null
      Invoke-ImageClean
      break
    }
    "start" {
      Invoke-Compose @("-f", $composeFile, "start") | Out-Null
      break
    }
    "stop" {
      Invoke-Compose @("-f", $composeFile, "stop") | Out-Null
      break
    }
    "logs" {
      Invoke-Compose @("-f", $composeFile, "logs", "-f", "apache") | Out-Null
      break
    }
    "image-clean" {
      Invoke-ImageClean
      break
    }
    "pull-prebuilt" {
      Invoke-PullPrebuilt
      break
    }
    "php-image-current" {
      if (-not (Test-PhpImageCurrent)) { exit 1 }
      break
    }
    "build-php" {
      Invoke-BuildPhp
      break
    }
    "recreate-php" {
      Invoke-RecreatePhp
      break
    }
    "up-all" {
      Invoke-ProxyCheck
      Invoke-CheckVersions
      Invoke-PullPrebuilt
      Invoke-Compose @("-f", $composeFile, "up", "-d") | Out-Null
      if ($localUrl) {
        Write-Host "[OK] Docker-Stack gestartet. URL: $localUrl"
      } else {
        Write-Host "[OK] Docker-Stack gestartet."
      }
      Show-AccessInfo
      break
    }
    "up-all-build" {
      Invoke-ProxyEnsure
      Invoke-CheckVersions

      if (-not (Has-InitDump)) {
        Write-Host "[up-all-build] Keine Init-Dumps vorhanden. Versuche, die Live-DB per SSH zu ziehen..."
        $pullExit = Invoke-BashScript @("scripts/db_pull.sh", "db/init/live.sql.gz") -AllowFailure
        if ($pullExit -eq 0) {
          Write-Host "[up-all-build] Live-DB-Dump nach _docker/db/init/live.sql.gz geladen"
        } else {
          Write-Host "[up-all-build] Live-DB-Dump fehlgeschlagen; fahre ohne Init-Dump fort (leere Datenbank bei erster Initialisierung)."
        }

        if ((Has-InitDump) -and (Test-DbVolumeExists)) {
          Write-Host "[up-all-build] Hinweis: DB-Volume ${projectName}_db_data existiert bereits; MariaDB importiert Init-Dumps nur bei erster Initialisierung."
          Write-Host "             Importiere den erzeugten Dump mit 'make -C _docker db-import-init-dump' oder setze zurueck mit 'make -C _docker db-reset-from-live CONFIRM=1'."
        }
      }

      Invoke-PullPrebuilt
      Invoke-BuildPhp
      Invoke-Compose @("-f", $composeFile, "up", "-d") | Out-Null
      Invoke-RecreatePhp
      Invoke-ImageClean

      if ($localUrl) {
        Write-Host "[OK] Docker-Stack gebaut & gestartet. URL: $localUrl"
      } else {
        Write-Host "[OK] Docker-Stack gebaut & gestartet."
      }
      Show-AccessInfo
      break
    }
    "down-all" {
      Invoke-Compose @("-f", $composeFile, "down") -AllowFailure | Out-Null
      Invoke-Compose @("-f", $proxyComposeFile, "down") -AllowFailure | Out-Null
      break
    }
    "restart-all" {
      Invoke-CheckVersions
      Invoke-Compose @("-f", $composeFile, "down") -AllowFailure | Out-Null
      Invoke-Compose @("-f", $proxyComposeFile, "down") -AllowFailure | Out-Null
      Ensure-DevProxyNetwork
      if ($pull -eq "1") {
        Write-Host "[INFO] Lade Proxy-Image(s): $($proxyServices -join ' ')"
        Invoke-Compose (@("-f", $proxyComposeFile, "pull") + $proxyServices) | Out-Null
      }
      Invoke-Compose @("-f", $proxyComposeFile, "up", "-d") | Out-Null
      Invoke-PullPrebuilt
      Invoke-Compose @("-f", $composeFile, "up", "-d") | Out-Null

      if ($localUrl) {
        Write-Host "[OK] Docker-Stack neu gestartet. URL: $localUrl"
      } else {
        Write-Host "[OK] Docker-Stack neu gestartet."
      }
      Show-AccessInfo
      break
    }
    "rebuild-all" {
      Invoke-CheckVersions
      Invoke-Compose @("-f", $composeFile, "down") -AllowFailure | Out-Null
      Invoke-Compose @("-f", $proxyComposeFile, "down") -AllowFailure | Out-Null
      Ensure-DevProxyNetwork
      if ($pull -eq "1") {
        Write-Host "[INFO] Lade Proxy-Image(s): $($proxyServices -join ' ')"
        Invoke-Compose (@("-f", $proxyComposeFile, "pull") + $proxyServices) | Out-Null
      }
      Invoke-Compose @("-f", $proxyComposeFile, "up", "-d") | Out-Null
      Invoke-PullPrebuilt
      Invoke-Compose @("-f", $composeFile, "up", "-d", "--build") | Out-Null
      Invoke-ImageClean

      if ($localUrl) {
        Write-Host "[OK] Docker-Stack neu gebaut & gestartet. URL: $localUrl"
      } else {
        Write-Host "[OK] Docker-Stack neu gebaut & gestartet."
      }
      Show-AccessInfo
      break
    }
    "db-pull-init" {
      Invoke-BashScript @("scripts/db_pull.sh", "db/init/live.sql.gz") | Out-Null
      break
    }
    "db-pull" {
      Invoke-BashScript @("scripts/db_pull.sh", "../live.sql.gz") | Out-Null
      break
    }
    "db-import" {
      $dump = Join-Path $repoRoot "live.sql.gz"
      Invoke-DbImportFromGzip -DumpPath $dump -MissingFileMessage "../live.sql.gz nicht gefunden (Repository-Root)"
      break
    }
    "db-import-init-dump" {
      $dump = Join-Path $dockerDir "db\init\live.sql.gz"
      Invoke-DbImportFromGzip -DumpPath $dump -MissingFileMessage "_docker/db/init/live.sql.gz nicht gefunden"
      break
    }
    "db-reset" {
      if ([Environment]::GetEnvironmentVariable("CONFIRM", "Process") -ne "1") {
        throw "Loeschen des DB-Volumes verweigert. Mit CONFIRM=1 erneut ausfuehren"
      }
      Invoke-Compose @("-f", $composeFile, "down", "-v") | Out-Null
      Invoke-BuildPhp
      Invoke-Compose @("-f", $composeFile, "up", "-d") | Out-Null
      Invoke-ImageClean
      break
    }
    "db-reset-from-live" {
      Invoke-BashScript @("scripts/db_pull.sh", "db/init/live.sql.gz") | Out-Null
      if ([Environment]::GetEnvironmentVariable("CONFIRM", "Process") -ne "1") {
        throw "Loeschen des DB-Volumes verweigert. Mit CONFIRM=1 erneut ausfuehren"
      }
      Invoke-Compose @("-f", $composeFile, "down", "-v") | Out-Null
      Invoke-BuildPhp
      Invoke-Compose @("-f", $composeFile, "up", "-d") | Out-Null
      Invoke-ImageClean
      break
    }
    "check-versions" {
      Invoke-CheckVersions
      break
    }
  }
} finally {
  Pop-Location
}
