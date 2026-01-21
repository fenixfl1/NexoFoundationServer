import { MigrationInterface, QueryRunner } from 'typeorm'

export class SponsorRole2Backfill1778000001000
  implements MigrationInterface
{
  name = 'SponsorRole2Backfill1778000001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO PUBLIC."SPONSOR" (
        "CREATED_AT",
        "CREATED_BY",
        "STATE",
        "PERSON_ID",
        "NAME",
        "TYPE",
        "TAX_ID"
      )
      SELECT
        NOW(),
        NULL,
        'A',
        p."PERSON_ID",
        TRIM(p."NAME" || ' ' || p."LAST_NAME"),
        'person',
        p."IDENTITY_DOCUMENT"
      FROM PUBLIC."PERSON" p
      WHERE p."ROLE_ID" = 2
        AND NOT EXISTS (
          SELECT 1
          FROM PUBLIC."SPONSOR" s
          WHERE s."PERSON_ID" = p."PERSON_ID"
        )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM PUBLIC."SPONSOR" s
      USING PUBLIC."PERSON" p
      WHERE s."PERSON_ID" = p."PERSON_ID"
        AND p."ROLE_ID" = 2
        AND s."TYPE" = 'person'
        AND s."CREATED_BY" IS NULL
    `)
  }
}
