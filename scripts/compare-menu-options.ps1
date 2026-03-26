$ErrorActionPreference = "Stop"

function Get-EnvValue {
  param(
    [string]$FilePath,
    [string]$Key
  )

  $line = Get-Content $FilePath | Where-Object { $_ -match "^${Key}=" } | Select-Object -First 1
  if (-not $line) {
    throw "No se encontró la variable '$Key' en $FilePath"
  }

  return ($line -replace "^${Key}=", "").Trim()
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path (Split-Path -Parent $scriptDir) ".env"
$pgBin = $env:PG_BIN

if (-not $pgBin) {
  $pgBin = "C:\Program Files\PostgreSQL\17\bin"
}

$psql = Join-Path $pgBin "psql.exe"
if (-not (Test-Path $psql)) {
  throw "No se encontró psql.exe en $psql"
}

$srcHost = Get-EnvValue -FilePath $envFile -Key "DB_HOST"
$srcPort = Get-EnvValue -FilePath $envFile -Key "DB_PORT"
$srcUser = Get-EnvValue -FilePath $envFile -Key "DB_USERNAME"
$srcPass = Get-EnvValue -FilePath $envFile -Key "DB_PASSWORD"
$srcDb = Get-EnvValue -FilePath $envFile -Key "DB_NAME"
$dstUri = Get-EnvValue -FilePath $envFile -Key "DATABASE_URL"

$ids = @(
  "0-0","0-5","0-5-1","0-5-2","0-5-3","0-5-4","0-5-5",
  "0-18","0-18-1","0-18-2","0-18-3",
  "0-19","0-19-1","0-19-2",
  "0-20","0-20-1","0-20-2","0-20-3"
)

$idList = ($ids | ForEach-Object { "'$_'" }) -join ", "
$sql = @"
select 'COUNT' as section, count(*)::text as c1, coalesce(max("CREATED_AT")::text, '') as c2, '' as c3, '' as c4, '' as c5
from public."MENU_OPTION"
union all
select 'ROW', "MENU_OPTION_ID", "NAME", coalesce("PARENT_ID", ''), coalesce("PATH", ''), "STATE"
from public."MENU_OPTION"
where "MENU_OPTION_ID" in ($idList)
order by section, c1;
"@

Write-Host "=== LOCAL ===" -ForegroundColor Cyan
$env:PGPASSWORD = $srcPass
& $psql -h $srcHost -p $srcPort -U $srcUser -d $srcDb -F "|" -At -c $sql
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== CLOUD ===" -ForegroundColor Cyan
& $psql $dstUri -F "|" -At -c $sql
