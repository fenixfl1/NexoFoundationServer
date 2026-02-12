BEGIN;

WITH ensured_action AS (
  INSERT INTO PUBLIC."ACTION"
    ("CREATED_AT", "CREATED_BY", "STATE", "NAME", "DESCRIPTION")
  SELECT
    NOW(),
    NULL,
    'A',
    'VIEW',
    'Permite visualizar la opción de menú.'
  WHERE NOT EXISTS (
    SELECT 1
    FROM PUBLIC."ACTION"
    WHERE UPPER("NAME") = 'VIEW'
  )
  RETURNING "ACTION_ID"
),
action_row AS (
  SELECT "ACTION_ID" FROM ensured_action
  UNION
  SELECT "ACTION_ID"
  FROM PUBLIC."ACTION"
  WHERE UPPER("NAME") = 'VIEW'
  LIMIT 1
),
menu_option_upsert AS (
  INSERT INTO PUBLIC."MENU_OPTION" (
    "CREATED_AT",
    "CREATED_BY",
    "STATE",
    "MENU_OPTION_ID",
    "NAME",
    "DESCRIPTION",
    "PATH",
    "TYPE",
    "ICON",
    "ORDER",
    "PARENT_ID"
  )
  VALUES (
    NOW(),
    NULL,
    'A',
    '0-5-3',
    'Actividades y voluntariado',
    'Actividades formativas y oportunidades de voluntariado.',
    '/activities',
    'item',
    NULL,
    4,
    '0-5'
  )
  ON CONFLICT ("MENU_OPTION_ID") DO UPDATE
  SET
    "NAME" = EXCLUDED."NAME",
    "DESCRIPTION" = EXCLUDED."DESCRIPTION",
    "PATH" = EXCLUDED."PATH",
    "TYPE" = EXCLUDED."TYPE",
    "ICON" = EXCLUDED."ICON",
    "ORDER" = EXCLUDED."ORDER",
    "PARENT_ID" = EXCLUDED."PARENT_ID",
    "STATE" = 'A'
  RETURNING "MENU_OPTION_ID"
),
permission_row AS (
  INSERT INTO PUBLIC."PERMISSION"
    ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "ACTION_ID", "DESCRIPTION")
  SELECT
    NOW(),
    NULL,
    'A',
    mo."MENU_OPTION_ID",
    ar."ACTION_ID",
    'Acceso a Actividades y voluntariado'
  FROM menu_option_upsert mo
  CROSS JOIN action_row ar
  WHERE NOT EXISTS (
    SELECT 1
    FROM PUBLIC."PERMISSION" p
    WHERE p."MENU_OPTION_ID" = mo."MENU_OPTION_ID"
      AND p."ACTION_ID" = ar."ACTION_ID"
  )
  RETURNING "PERMISSION_ID"
),
all_permissions AS (
  SELECT "PERMISSION_ID" FROM permission_row
  UNION
  SELECT p."PERMISSION_ID"
  FROM PUBLIC."PERMISSION" p
  JOIN menu_option_upsert mo
    ON mo."MENU_OPTION_ID" = p."MENU_OPTION_ID"
  JOIN action_row ar
    ON ar."ACTION_ID" = p."ACTION_ID"
)
INSERT INTO PUBLIC."PERMISSION_X_ROLE"
  ("CREATED_AT", "CREATED_BY", "STATE", "PERMISSION_ID", "ROLE_ID")
SELECT
  NOW(),
  NULL,
  'A',
  ap."PERMISSION_ID",
  3
FROM all_permissions ap
WHERE NOT EXISTS (
  SELECT 1
  FROM PUBLIC."PERMISSION_X_ROLE" pxr
  WHERE pxr."PERMISSION_ID" = ap."PERMISSION_ID"
    AND pxr."ROLE_ID" = 3
);

COMMIT;
