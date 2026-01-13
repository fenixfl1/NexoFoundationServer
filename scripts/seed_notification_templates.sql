BEGIN;

INSERT INTO PUBLIC."NOTIFICATION_TEMPLATE" (
  "CREATED_AT",
  "CREATED_BY",
  "STATE",
  "TEMPLATE_KEY",
  "NAME",
  "DESCRIPTION",
  "CHANNEL",
  "SUBJECT",
  "BODY",
  "PARAMETERS",
  "DEFAULTS",
  "MENU_OPTION_ID"
)
SELECT
  NOW(),
  NULL,
  'A',
  payload.template_key,
  payload.name,
  payload.description,
  payload.channel,
  payload.subject,
  payload.body,
  payload.parameters::jsonb,
  payload.defaults::jsonb,
  payload.menu_option_id
FROM (
  VALUES
    (
      'REQUEST_STATUS_UPDATE',
      'Actualización de solicitud',
      'Notifica a los postulantes cuando cambia el estado de su solicitud.',
      'email',
      'Actualización de tu solicitud',
      'Hola {{name}}, tu solicitud ha cambiado al estado {{status_label}}.',
      '{"keys":["name","status_label","request_id"]}',
      '{"from":"seguimiento@nexofundacion.org"}',
      'requests'
    ),
    (
      'WELCOME_STUDENT',
      'Bienvenida a becarios',
      'Mensaje de bienvenida con información inicial.',
      'email',
      '¡Bienvenido a la Fundación!',
      'Hola {{name}}, nos alegra tenerte como parte del programa. Adjuntamos tu carta de bienvenida.',
      '{"keys":["name","cohort"]}',
      '{"from":"coordinacion@nexofundacion.org"}',
      'students'
    ),
    (
      'REMINDER_APPOINTMENT',
      'Recordatorio de citas',
      'Envía recordatorios para citas programadas.',
      'sms',
      'Recordatorio de cita',
      'Hola {{name}}, recuerda tu cita el {{date}} a las {{time}}.',
      '{"keys":["name","date","time"]}',
      '{"sender":"NexoFund"}',
      'requests'
    )
) AS payload (
  template_key,
  name,
  description,
  channel,
  subject,
  body,
  parameters,
  defaults,
  menu_option_id
)
ON CONFLICT ("TEMPLATE_KEY") DO UPDATE
SET
  "NAME" = EXCLUDED."NAME",
  "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "CHANNEL" = EXCLUDED."CHANNEL",
  "SUBJECT" = EXCLUDED."SUBJECT",
  "BODY" = EXCLUDED."BODY",
  "PARAMETERS" = EXCLUDED."PARAMETERS",
  "DEFAULTS" = EXCLUDED."DEFAULTS",
  "MENU_OPTION_ID" = EXCLUDED."MENU_OPTION_ID",
  "STATE" = 'A';

COMMIT;
