BEGIN;

WITH student_people AS (
  SELECT
    p."PERSON_ID",
    p."NAME",
    p."LAST_NAME",
    ROW_NUMBER() OVER (ORDER BY p."PERSON_ID") AS row_num
  FROM PUBLIC."PERSON" p
  INNER JOIN PUBLIC."USER" u ON u."PERSON_ID" = p."PERSON_ID"
  INNER JOIN PUBLIC."ROLES_X_USER" rxu
    ON rxu."USER_ID" = u."USER_ID"
    AND rxu."ROLE_ID" = 3
  WHERE NOT EXISTS (
    SELECT 1
    FROM PUBLIC."REQUEST" r
    WHERE r."PERSON_ID" = p."PERSON_ID"
  )
)
INSERT INTO PUBLIC."REQUEST" (
  "CREATED_AT",
  "CREATED_BY",
  "STATE",
  "PERSON_ID",
  "STUDENT_ID",
  "REQUEST_TYPE",
  "STATUS",
  "ASSIGNED_COORDINATOR",
  "NEXT_APPOINTMENT",
  "COHORT",
  "NOTES"
)
SELECT
  NOW(),
  NULL,
  'A',
  sp."PERSON_ID",
  s."STUDENT_ID",
  CASE (sp.row_num % 3)
    WHEN 0 THEN 'Renovación'
    WHEN 1 THEN 'Nueva beca'
    ELSE 'Ayuda puntual'
  END AS REQUEST_TYPE,
  (
    CASE (sp.row_num % 4)
      WHEN 0 THEN 'in_review'
      WHEN 1 THEN 'approved'
      WHEN 2 THEN 'scheduled'
      ELSE 'new'
    END
  )::"public"."REQUEST_status_enum" AS STATUS,
  CASE (sp.row_num % 3)
    WHEN 0 THEN 'María López'
    WHEN 1 THEN 'Carlos Taveras'
    ELSE 'Coordinador sin asignar'
  END AS ASSIGNED_COORDINATOR,
  CASE (sp.row_num % 4)
    WHEN 2 THEN NOW() + INTERVAL '5 day'
    ELSE NULL
  END AS NEXT_APPOINTMENT,
  TO_CHAR(NOW(), 'YYYY') AS COHORT,
  'Solicitud generada automáticamente para carga inicial.'
FROM student_people sp
LEFT JOIN PUBLIC."STUDENT" s ON s."PERSON_ID" = sp."PERSON_ID";

COMMIT;
