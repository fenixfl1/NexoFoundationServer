import { MigrationInterface, QueryRunner } from 'typeorm'

export class SponsorDropContactColumns1778000002000
  implements MigrationInterface
{
  name = 'SponsorDropContactColumns1778000002000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SPONSOR"
      DROP COLUMN IF EXISTS "CONTACT_NAME",
      DROP COLUMN IF EXISTS "CONTACT_EMAIL",
      DROP COLUMN IF EXISTS "CONTACT_PHONE",
      DROP COLUMN IF EXISTS "ADDRESS"
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SPONSOR"
      ADD COLUMN IF NOT EXISTS "CONTACT_NAME" character varying(150)
    `)
    await queryRunner.query(`
      ALTER TABLE "SPONSOR"
      ADD COLUMN IF NOT EXISTS "CONTACT_EMAIL" character varying(150)
    `)
    await queryRunner.query(`
      ALTER TABLE "SPONSOR"
      ADD COLUMN IF NOT EXISTS "CONTACT_PHONE" character varying(30)
    `)
    await queryRunner.query(`
      ALTER TABLE "SPONSOR"
      ADD COLUMN IF NOT EXISTS "ADDRESS" text
    `)
  }
}
