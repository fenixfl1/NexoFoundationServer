import { MigrationInterface, QueryRunner } from 'typeorm'

export class AcademicInfoMenuOption1777000000000
  implements MigrationInterface
{
  name = 'AcademicInfoMenuOption1777000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "ACTION" (
        "CREATED_AT",
        "CREATED_BY",
        "STATE",
        "NAME",
        "DESCRIPTION"
      )
      SELECT
        NOW(),
        NULL,
        'A',
        'view',
        'Permite visualizar el recurso'
      WHERE NOT EXISTS (
        SELECT 1
        FROM "ACTION"
        WHERE UPPER("NAME") = 'VIEW'
      )
    `)

    await queryRunner.query(`
      INSERT INTO "MENU_OPTION" (
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
        '0-5-2',
        'Información Académica',
        'Información académica',
        '/0-5-2/academic_info',
        'item',
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mortarboard" viewBox="0 0 16 16"><path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917zM8 8.46 1.758 5.965 8 3.052l6.242 2.913z"/><path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46z"/></svg>',
        3,
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
    `)

    await queryRunner.query(`
      WITH action_choice AS (
        SELECT "ACTION_ID"
        FROM "ACTION"
        WHERE UPPER("NAME") IN ('VIEW', 'READ', 'LIST', 'GET')
        ORDER BY "ACTION_ID"
        LIMIT 1
      ),
      action_fallback AS (
        SELECT "ACTION_ID"
        FROM "ACTION"
        ORDER BY "ACTION_ID"
        LIMIT 1
      ),
      chosen AS (
        SELECT "ACTION_ID" FROM action_choice
        UNION ALL
        SELECT "ACTION_ID" FROM action_fallback
        LIMIT 1
      )
      INSERT INTO "PERMISSION" (
        "CREATED_AT",
        "CREATED_BY",
        "STATE",
        "MENU_OPTION_ID",
        "ACTION_ID",
        "DESCRIPTION"
      )
      SELECT
        NOW(),
        NULL,
        'A',
        '0-5-2',
        chosen."ACTION_ID",
        'Acceso a Información Académica'
      FROM chosen
      WHERE NOT EXISTS (
        SELECT 1
        FROM "PERMISSION" p
        WHERE p."MENU_OPTION_ID" = '0-5-2'
          AND p."ACTION_ID" = chosen."ACTION_ID"
      )
    `)

    await queryRunner.query(`
      INSERT INTO "PERMISSION_X_ROLE" (
        "CREATED_AT",
        "CREATED_BY",
        "STATE",
        "PERMISSION_ID",
        "ROLE_ID"
      )
      SELECT
        NOW(),
        NULL,
        'A',
        p."PERMISSION_ID",
        1
      FROM "PERMISSION" p
      WHERE p."MENU_OPTION_ID" = '0-5-2'
        AND NOT EXISTS (
          SELECT 1
          FROM "PERMISSION_X_ROLE" pxr
          WHERE pxr."PERMISSION_ID" = p."PERMISSION_ID"
            AND pxr."ROLE_ID" = 1
        )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "PERMISSION_X_ROLE" pxr
      USING "PERMISSION" p
      WHERE pxr."PERMISSION_ID" = p."PERMISSION_ID"
        AND pxr."ROLE_ID" = 1
        AND p."MENU_OPTION_ID" = '0-5-2'
        AND p."DESCRIPTION" = 'Acceso a Información Académica'
    `)

    await queryRunner.query(`
      DELETE FROM "PERMISSION" p
      WHERE p."MENU_OPTION_ID" = '0-5-2'
        AND p."DESCRIPTION" = 'Acceso a Información Académica'
        AND NOT EXISTS (
          SELECT 1
          FROM "PERMISSION_X_ROLE" pxr
          WHERE pxr."PERMISSION_ID" = p."PERMISSION_ID"
        )
    `)
  }
}
