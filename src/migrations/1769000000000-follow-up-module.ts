import { MigrationInterface, QueryRunner } from 'typeorm'

export class FollowUpModule1769000000000 implements MigrationInterface {
  name = 'FollowUpModule1769000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."FOLLOW_UP_status_enum" AS ENUM (
        'open',
        'completed',
        'cancelled'
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "FOLLOW_UP" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "FOLLOW_UP_ID" SERIAL NOT NULL,
        "STUDENT_ID" integer NOT NULL,
        "APPOINTMENT_ID" integer,
        "FOLLOW_UP_DATE" TIMESTAMP NOT NULL,
        "SUMMARY" text NOT NULL,
        "NOTES" text,
        "NEXT_APPOINTMENT" TIMESTAMP,
        "STATUS" "public"."FOLLOW_UP_status_enum" NOT NULL DEFAULT 'open',
        CONSTRAINT "PK_FOLLOW_UP" PRIMARY KEY ("FOLLOW_UP_ID")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "FOLLOW_UP"
      ADD CONSTRAINT "FK_FOLLOW_UP_STUDENT"
      FOREIGN KEY ("STUDENT_ID") REFERENCES "STUDENT"("STUDENT_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "FOLLOW_UP"
      ADD CONSTRAINT "FK_FOLLOW_UP_APPOINTMENT"
      FOREIGN KEY ("APPOINTMENT_ID") REFERENCES "APPOINTMENT"("APPOINTMENT_ID")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "FOLLOW_UP" DROP CONSTRAINT "FK_FOLLOW_UP_APPOINTMENT"`
    )
    await queryRunner.query(
      `ALTER TABLE "FOLLOW_UP" DROP CONSTRAINT "FK_FOLLOW_UP_STUDENT"`
    )
    await queryRunner.query(`DROP TABLE "FOLLOW_UP"`)
    await queryRunner.query(`DROP TYPE "public"."FOLLOW_UP_status_enum"`)
  }
}
