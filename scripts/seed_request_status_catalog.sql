BEGIN;

WITH catalog AS (
  INSERT INTO PUBLIC."CATALOG" (
    "CREATED_AT",
    "CREATED_BY",
    "STATE",
    "KEY",
    "NAME",
    "DESCRIPTION"
  )
  VALUES (
    NOW(),
    NULL,
    'A',
    'ID_LIST_REQUEST_STATUS',
    'Estados de solicitudes',
    'Catálogo maestro de estados del flujo de solicitudes.'
  )
  ON CONFLICT ("KEY") DO UPDATE
    SET
      "NAME" = EXCLUDED."NAME",
      "DESCRIPTION" = EXCLUDED."DESCRIPTION",
      "STATE" = 'A'
  RETURNING "CATALOG_ID"
)
INSERT INTO PUBLIC."CATALOG_ITEM" (
  "CREATED_AT",
  "CREATED_BY",
  "STATE",
  "CATALOG_ID",
  "VALUE",
  "LABEL",
  "ORDER",
  "EXTRA"
)
SELECT
  NOW(),
  NULL,
  'A',
  catalog."CATALOG_ID",
  items.value,
  items.label,
  items.sort_order,
  items.extra::json
FROM catalog
CROSS JOIN (
  VALUES
    ('P', 'Pendiente', 1, '{"color":"blue","description":"Solicitud en espera de revisión"}'),
    ('R', 'En revisión', 2, '{"color":"gold","description":"Analizando documentación"}'),
    ('A', 'Aprobada', 3, '{"color":"green","description":"Solicitud aprobada"}'),
    ('D', 'Rechazada', 4, '{"color":"red","description":"Solicitud denegada"}'),
    ('C', 'Cita programada', 5, '{"color":"purple","description":"Seguimiento con cita calendarizada"}')
) AS items(value, label, sort_order, extra)
ON CONFLICT ("CATALOG_ID", "VALUE") DO UPDATE
  SET
    "LABEL" = EXCLUDED."LABEL",
    "ORDER" = EXCLUDED."ORDER",
    "EXTRA" = EXCLUDED."EXTRA",
    "STATE" = 'A';

COMMIT;
