import { MigrationInterface, QueryRunner } from 'typeorm'

export class RequestStatusCodes1766000000000 implements MigrationInterface {
  name = 'RequestStatusCodes1766000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."REQUEST_status_enum" RENAME TO "REQUEST_status_enum_old"
    `)

    await queryRunner.query(`
      CREATE TYPE "public"."REQUEST_status_enum" AS ENUM ('P', 'R', 'A', 'D', 'C')
    `)

    await queryRunner.query(`
      ALTER TABLE "REQUEST"
      ALTER COLUMN "STATUS" DROP DEFAULT
    `)

    await queryRunner.query(`
      ALTER TABLE "REQUEST"
      ALTER COLUMN "STATUS"
      TYPE "public"."REQUEST_status_enum"
      USING (
        CASE
          WHEN "STATUS"::text IN ('new', 'pending') THEN 'P'
          WHEN "STATUS"::text = 'in_review' THEN 'R'
          WHEN "STATUS"::text = 'approved' THEN 'A'
          WHEN "STATUS"::text = 'rejected' THEN 'D'
          WHEN "STATUS"::text = 'scheduled' THEN 'C'
          ELSE 'P'
        END
      )::"public"."REQUEST_status_enum"
    `)

    await queryRunner.query(`
      ALTER TABLE "REQUEST"
      ALTER COLUMN "STATUS" SET DEFAULT 'P'
    `)

    await queryRunner.query(`
      DROP TYPE "public"."REQUEST_status_enum_old"
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."REQUEST_status_enum" RENAME TO "REQUEST_status_enum_new"
    `)

    await queryRunner.query(`
      CREATE TYPE "public"."REQUEST_status_enum" AS ENUM (
        'pending',
        'in_review',
        'approved',
        'rejected',
        'scheduled'
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "REQUEST"
      ALTER COLUMN "STATUS" DROP DEFAULT
    `)

    await queryRunner.query(`
      ALTER TABLE "REQUEST"
      ALTER COLUMN "STATUS"
      TYPE "public"."REQUEST_status_enum"
      USING (
        CASE
          WHEN "STATUS"::text = 'P' THEN 'pending'
          WHEN "STATUS"::text = 'R' THEN 'in_review'
          WHEN "STATUS"::text = 'A' THEN 'approved'
          WHEN "STATUS"::text = 'D' THEN 'rejected'
          WHEN "STATUS"::text = 'C' THEN 'scheduled'
          ELSE 'pending'
        END
      )::"public"."REQUEST_status_enum"
    `)

    await queryRunner.query(`
      ALTER TABLE "REQUEST"
      ALTER COLUMN "STATUS" SET DEFAULT 'pending'
    `)

    await queryRunner.query(`
      DROP TYPE "public"."REQUEST_status_enum_new"
    `)
  }
}
