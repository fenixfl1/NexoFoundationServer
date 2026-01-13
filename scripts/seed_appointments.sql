BEGIN;

INSERT INTO PUBLIC."APPOINTMENT" (
  "CREATED_AT",
  "CREATED_BY",
  "STATE",
  "PERSON_ID",
  "REQUEST_ID",
  "STUDENT_ID",
  "TITLE",
  "DESCRIPTION",
  "START_AT",
  "END_AT",
  "LOCATION",
  "STATUS",
  "NOTES"
)
VALUES
  (
    NOW(),
    1,
    'A',
    1,
    1,
    1,
    'Seguimiento académico',
    'Revisión de desempeño y metas del becario.',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day 1 hour',
    'Sala virtual',
    'scheduled',
    'Enviar material previo'
  ),
  (
    NOW(),
    1,
    'A',
    2,
    NULL,
    2,
    'Actualización de expediente',
    'Entrega de documentación requerida.',
    NOW() + INTERVAL '2 day',
    NOW() + INTERVAL '2 day 30 minute',
    'Oficina principal',
    'scheduled',
    NULL
  ),
  (
    NOW(),
    1,
    'A',
    3,
    3,
    NULL,
    'Entrevista inicial',
    'Presentación del caso de la nueva solicitud.',
    NOW() + INTERVAL '3 day',
    NOW() + INTERVAL '3 day 45 minute',
    'Oficina Santo Domingo',
    'scheduled',
    'Confirmar asistencia'
  )
ON CONFLICT DO NOTHING;

COMMIT;
