import { MigrationInterface, QueryRunner } from 'typeorm'

export class StudentStatusEnumUpdate1765000003400
  implements MigrationInterface
{
  name = 'StudentStatusEnumUpdate1765000003400'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."STUDENT_scholarship_status_enum" RENAME TO "STUDENT_scholarship_status_enum_old"`
    )

    await queryRunner.query(
      `CREATE TYPE "public"."STUDENT_scholarship_status_enum" AS ENUM ('P', 'A', 'S', 'C', 'G')`
    )

    await queryRunner.query(
      `ALTER TABLE "STUDENT" ALTER COLUMN "SCHOLARSHIP_STATUS" DROP DEFAULT`
    )

    await queryRunner.query(`
      ALTER TABLE "STUDENT"
      ALTER COLUMN "SCHOLARSHIP_STATUS"
      TYPE "public"."STUDENT_scholarship_status_enum"
      USING (
        CASE "SCHOLARSHIP_STATUS"
          WHEN 'pending' THEN 'P'
          WHEN 'active' THEN 'A'
          WHEN 'suspended' THEN 'S'
          WHEN 'completed' THEN 'C'
          WHEN 'graduated' THEN 'G'
          ELSE "SCHOLARSHIP_STATUS"::text
        END
      )::"public"."STUDENT_scholarship_status_enum"
    `)

    await queryRunner.query(
      `ALTER TABLE "STUDENT" ALTER COLUMN "SCHOLARSHIP_STATUS" SET DEFAULT 'P'`
    )

    await queryRunner.query(
      `DROP TYPE "public"."STUDENT_scholarship_status_enum_old"`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."STUDENT_scholarship_status_enum" RENAME TO "STUDENT_scholarship_status_enum_old"`
    )

    await queryRunner.query(`
      CREATE TYPE "public"."STUDENT_scholarship_status_enum" AS ENUM (
        'pending',
        'active',
        'suspended',
        'completed',
        'graduated'
      )
    `)

    await queryRunner.query(
      `ALTER TABLE "STUDENT" ALTER COLUMN "SCHOLARSHIP_STATUS" DROP DEFAULT`
    )

    await queryRunner.query(`
      ALTER TABLE "STUDENT"
      ALTER COLUMN "SCHOLARSHIP_STATUS"
      TYPE "public"."STUDENT_scholarship_status_enum"
      USING (
        CASE "SCHOLARSHIP_STATUS"
          WHEN 'P' THEN 'pending'
          WHEN 'A' THEN 'active'
          WHEN 'S' THEN 'suspended'
          WHEN 'C' THEN 'completed'
          WHEN 'G' THEN 'graduated'
          ELSE "SCHOLARSHIP_STATUS"::text
        END
      )::"public"."STUDENT_scholarship_status_enum"
    `)

    await queryRunner.query(
      `ALTER TABLE "STUDENT" ALTER COLUMN "SCHOLARSHIP_STATUS" SET DEFAULT 'pending'`
    )

    await queryRunner.query(
      `DROP TYPE "public"."STUDENT_scholarship_status_enum_old"`
    )
  }
}
