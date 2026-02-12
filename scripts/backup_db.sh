#!/usr/bin/env bash
set -euo pipefail

# Backups para la base nexo-foundation (Neon)
# Genera tres archivos gzip en ./backups:
#  - nexo-foundation_schema_<TS>.sql.gz (solo estructura)
#  - nexo-foundation_data_<TS>.sql.gz   (solo datos)
#  - nexo-foundation_full_<TS>.sql.gz   (estructura + datos)

CONN_URI="postgresql://neondb_owner:npg_sLSo5cGYa4gQ@ep-twilight-flower-aeiafrt0-pooler.c-2.us-east-2.aws.neon.tech/nexo-foundation?sslmode=require&channel_binding=require"
DB_NAME="nexo-foundation"
BACKUP_DIR="$(dirname "$0")/backups"
TS=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Localiza pg_dump (permite sobreescribir con PG_BIN)
PG_DUMP_BIN=${PG_DUMP_BIN:-"$(command -v pg_dump || true)"}
if [ -z "$PG_DUMP_BIN" ]; then
  echo "❌ No se encontró pg_dump. Instala el cliente de PostgreSQL o define PG_DUMP_BIN=/ruta/pg_dump" >&2
  exit 1
fi

# Estructura
$PG_DUMP_BIN "$CONN_URI" \
  --schema-only \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_DIR/${DB_NAME}_schema_${TS}.sql.gz"

# Datos
$PG_DUMP_BIN "$CONN_URI" \
  --data-only \
  --inserts \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_DIR/${DB_NAME}_data_${TS}.sql.gz"

# Completo
$PG_DUMP_BIN "$CONN_URI" \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_DIR/${DB_NAME}_full_${TS}.sql.gz"

ls -1 "$BACKUP_DIR" | sed 's/^/✓ /'
