import { MigrationInterface, QueryRunner } from 'typeorm'

export class OperationalAutomationTemplates1783000000000
  implements MigrationInterface
{
  name = 'OperationalAutomationTemplates1783000000000'

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
            'REMINDER_APPOINTMENT',
            'Recordatorio de citas',
            'Envía recordatorios por correo antes de una cita próxima.',
            'email',
            'Recordatorio de tu cita académica',
            'Hola {{name}}, te recordamos tu cita "{{title}}" el {{date}} a las {{time}}.{{#if location}} Lugar: {{location}}.{{/if}}',
            '{"keys":["name","title","date","time","location"]}',
            '{"from":"seguimiento@nexofundacion.org"}',
            NULL
          ),
          (
            'SPONSOR_GRATITUDE_REMINDER',
            'Agradecimiento a patrocinadores',
            'Mensaje mensual de agradecimiento para patrocinadores con compromisos activos.',
            'email',
            'Gracias por apoyar a Nexo Fundación',
            'Hola {{name}}, gracias por apoyar a Nexo Fundación durante {{month_label}} {{year}}. Actualmente registramos {{active_pledges}} compromiso(s) activo(s) por un total de {{total_amount}}.',
            '{"keys":["name","month_label","year","active_pledges","total_amount","sponsor_name"]}',
            '{"from":"relaciones@nexofundacion.org"}',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM PUBLIC."NOTIFICATION_TEMPLATE"
      WHERE "TEMPLATE_KEY" IN (
        'REMINDER_APPOINTMENT',
        'SPONSOR_GRATITUDE_REMINDER'
      )
    `)
  }
}
