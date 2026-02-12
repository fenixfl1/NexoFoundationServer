$ErrorActionPreference = "Stop"

# Ruta del binario de PostgreSQL en Windows
$pgBin = "C:\\Program Files\\PostgreSQL\\17\\bin"

# Origen (Neon)
$srcUri = "postgresql://neondb_owner:npg_sLSo5cGYa4gQ@ep-twilight-flower-aeiafrt0-pooler.c-2.us-east-2.aws.neon.tech/nexo-foundation?sslmode=require&channel_binding=require"

# Destino (local)
$dstUser = "postgres"
$dstPass = "admin"
$dstHost = "localhost"
$dstPort = 5432
$dstDb   = "nexo-foundation"
$dstUri  = "postgresql://${dstUser}:${dstPass}@${dstHost}:${dstPort}/${dstDb}"
$checkConn = "postgresql://${dstUser}:${dstPass}@${dstHost}:${dstPort}/postgres"

# Crear DB destino si no existe
$exists = & "${pgBin}\psql.exe" $checkConn -tAc "SELECT 1 FROM pg_database WHERE datname = '$dstDb'"
if (-not $exists) {
  & "${pgBin}\psql.exe" $checkConn -c "CREATE DATABASE \"$dstDb\";"
}

# Limpiar esquema destino
& "${pgBin}\psql.exe" $dstUri -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Dump + restore en streaming (evita BOM/archivos temporales)
& "${pgBin}\pg_dump.exe" $srcUri --no-owner --no-privileges |
  & "${pgBin}\psql.exe" $dstUri

Write-Host "Sincronización completada." -ForegroundColor Green
