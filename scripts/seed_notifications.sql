BEGIN;

WITH templates AS (
  SELECT
    "TEMPLATE_ID",
    "TEMPLATE_KEY"
  FROM PUBLIC."NOTIFICATION_TEMPLATE"
  WHERE "TEMPLATE_KEY" IN (
    'REQUEST_STATUS_UPDATE',
    'WELCOME_STUDENT',
    'REMINDER_APPOINTMENT'
  )
)
INSERT INTO PUBLIC."NOTIFICATION" (
  "CREATED_AT",
  "CREATED_BY",
  "STATE",
  "TEMPLATE_ID",
  "CHANNEL",
  "RECIPIENT",
  "SUBJECT",
  "BODY",
  "PAYLOAD",
  "STATUS",
  "RELATED_ENTITY",
  "RELATED_ID",
  "SCHEDULED_AT"
)
SELECT
  NOW(),
  NULL,
  'A',
  templates."TEMPLATE_ID",
  payload.channel::"public"."NOTIFICATION_channel_enum",
  payload.recipient,
  payload.subject,
  payload.body,
  payload.payload::jsonb,
  payload.status::"public"."NOTIFICATION_status_enum",
  payload.related_entity,
  payload.related_id,
  payload.scheduled_at
FROM templates
JOIN (
  VALUES
    (
      'REQUEST_STATUS_UPDATE',
      'email',
      'maria.lopez@example.com',
      'Actualización de tu solicitud',
      'Hola María, tu solicitud ha cambiado al estado Aprobada.',
      '{"request_id":101,"status":"A"}',
      'S',
      'REQUEST',
      '101',
      NOW()
    ),
    (
      'REMINDER_APPOINTMENT',
      'sms',
      '+18095551234',
      'Recordatorio de cita',
      'Hola Carlos, recuerda tu cita el 2025-01-20 a las 10:00 AM.',
      '{"request_id":202,"date":"2025-01-20","time":"10:00"}',
      'C',
      'REQUEST',
      '202',
      NOW() + INTERVAL '2 day'
    ),
    (
      'WELCOME_STUDENT',
      'email',
      'ana.perez@example.com',
      '¡Bienvenido a la Fundación!',
      'Hola Ana, nos alegra contar contigo en la cohorte 2025-1.',
      '{"student_id":301,"cohort":"2025-1"}',
      'P',
      'STUDENT',
      '301',
      NULL
    )
) AS payload (
  template_key,
  channel,
  recipient,
  subject,
  body,
  payload,
  status,
  related_entity,
  related_id,
  scheduled_at
) ON (templates."TEMPLATE_KEY" = payload.template_key)
ON CONFLICT DO NOTHING;

COMMIT;
