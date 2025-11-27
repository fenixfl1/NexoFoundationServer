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
menu_options AS (
  SELECT UNNEST(ARRAY[
    '0-18',
    '0-18-1',
    '0-18-2',
    '0-18-3',
    '0-19',
    '0-19-1',
    '0-19-2',
    '0-20',
    '0-20-1',
    '0-20-2'
  ]) AS menu_option_id
),
inserted_permissions AS (
  INSERT INTO PUBLIC."PERMISSION"
    ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "ACTION_ID", "DESCRIPTION")
  SELECT
    NOW(),
    NULL,
    'A',
    mo.menu_option_id,
    ar."ACTION_ID",
    CONCAT('Acceso a ', mo.menu_option_id)
  FROM menu_options mo
  CROSS JOIN action_row ar
  WHERE NOT EXISTS (
    SELECT 1
    FROM PUBLIC."PERMISSION" p
    WHERE p."MENU_OPTION_ID" = mo.menu_option_id
      AND p."ACTION_ID" = ar."ACTION_ID"
  )
  RETURNING "PERMISSION_ID", "MENU_OPTION_ID"
),
all_permissions AS (
  SELECT
    ip."PERMISSION_ID",
    ip."MENU_OPTION_ID"
  FROM inserted_permissions ip

  UNION

  SELECT
    p."PERMISSION_ID",
    p."MENU_OPTION_ID"
  FROM PUBLIC."PERMISSION" p
  JOIN menu_options mo
    ON mo.menu_option_id = p."MENU_OPTION_ID"
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
  roles.role_id
FROM all_permissions ap
CROSS JOIN (VALUES (1), (3)) AS roles(role_id)
WHERE NOT EXISTS (
  SELECT 1
  FROM PUBLIC."PERMISSION_X_ROLE" pxr
  WHERE pxr."PERMISSION_ID" = ap."PERMISSION_ID"
    AND pxr."ROLE_ID" = roles.role_id
);

COMMIT;
