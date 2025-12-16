import { MigrationInterface, QueryRunner } from 'typeorm'

export class ReferenceBaseColumns1765000005000
  implements MigrationInterface
{
  name = 'ReferenceBaseColumns1765000005000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "REFERENCE"
      ADD COLUMN IF NOT EXISTS "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "CREATED_BY" integer,
      ADD COLUMN IF NOT EXISTS "STATE" character(1) NOT NULL DEFAULT 'A'
    `)

    await queryRunner.query(`
      UPDATE "REFERENCE" SET "STATE" = 'A' WHERE "STATE" IS NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "REFERENCE"
      DROP COLUMN IF EXISTS "STATE",
      DROP COLUMN IF EXISTS "CREATED_BY",
      DROP COLUMN IF EXISTS "CREATED_AT"
    `)
  }
}
