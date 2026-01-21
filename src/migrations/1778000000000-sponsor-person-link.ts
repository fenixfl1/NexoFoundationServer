import { MigrationInterface, QueryRunner } from 'typeorm'

export class SponsorPersonLink1778000000000 implements MigrationInterface {
  name = 'SponsorPersonLink1778000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SPONSOR"
      ADD COLUMN IF NOT EXISTS "PERSON_ID" integer
    `)

    await queryRunner.query(`
      ALTER TABLE "SPONSOR"
      ADD CONSTRAINT "FK_SPONSOR_PERSON"
      FOREIGN KEY ("PERSON_ID") REFERENCES "PERSON" ("PERSON_ID")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SPONSOR"
      DROP CONSTRAINT IF EXISTS "FK_SPONSOR_PERSON"
    `)

    await queryRunner.query(`
      ALTER TABLE "SPONSOR"
      DROP COLUMN IF EXISTS "PERSON_ID"
    `)
  }
}
