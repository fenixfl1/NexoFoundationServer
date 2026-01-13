import { MigrationInterface, QueryRunner } from 'typeorm'

export class NotificationSeeds1767000001000 implements MigrationInterface {
  name = 'NotificationSeeds1767000001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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
        payload.channel::"public"."NOTIFICATION_channel_enum",
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
            NULL
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
            NULL
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
            NULL
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
    `)

    await queryRunner.query(`
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
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM PUBLIC."NOTIFICATION"
      WHERE "TEMPLATE_ID" IN (
        SELECT "TEMPLATE_ID"
        FROM PUBLIC."NOTIFICATION_TEMPLATE"
        WHERE "TEMPLATE_KEY" IN (
          'REQUEST_STATUS_UPDATE',
          'WELCOME_STUDENT',
          'REMINDER_APPOINTMENT'
        )
      )
    `)

    await queryRunner.query(`
      DELETE FROM PUBLIC."NOTIFICATION_TEMPLATE"
      WHERE "TEMPLATE_KEY" IN (
        'REQUEST_STATUS_UPDATE',
        'WELCOME_STUDENT',
        'REMINDER_APPOINTMENT'
      )
    `)
  }
}
