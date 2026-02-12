import { MigrationInterface, QueryRunner } from 'typeorm'

export class ActivityModule1781000000000 implements MigrationInterface {
  name = 'ActivityModule1781000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."ACTIVITY_status_enum" AS ENUM (
        'planned',
        'completed',
        'cancelled'
      )
    `)

    await queryRunner.query(`
      CREATE TYPE "public"."ACTIVITY_PARTICIPANT_status_enum" AS ENUM (
        'registered',
        'completed',
        'cancelled'
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "ACTIVITY" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "ACTIVITY_ID" SERIAL NOT NULL,
        "TITLE" character varying(150) NOT NULL,
        "DESCRIPTION" text,
        "START_AT" TIMESTAMP NOT NULL,
        "END_AT" TIMESTAMP,
        "LOCATION" character varying(150),
        "HOURS" numeric(4,1) NOT NULL DEFAULT 0,
        "CAPACITY" integer,
        "STATUS" "public"."ACTIVITY_status_enum" NOT NULL DEFAULT 'planned',
        CONSTRAINT "PK_ACTIVITY" PRIMARY KEY ("ACTIVITY_ID")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "ACTIVITY_PARTICIPANT" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "PARTICIPANT_ID" SERIAL NOT NULL,
        "ACTIVITY_ID" integer NOT NULL,
        "STUDENT_ID" integer NOT NULL,
        "STATUS" "public"."ACTIVITY_PARTICIPANT_status_enum" NOT NULL DEFAULT 'registered',
        "HOURS_EARNED" numeric(4,1) NOT NULL DEFAULT 0,
        "ATTENDED_AT" TIMESTAMP,
        CONSTRAINT "PK_ACTIVITY_PARTICIPANT" PRIMARY KEY ("PARTICIPANT_ID")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "ACTIVITY_PARTICIPANT"
      ADD CONSTRAINT "FK_ACTIVITY_PARTICIPANT_ACTIVITY"
      FOREIGN KEY ("ACTIVITY_ID") REFERENCES "ACTIVITY"("ACTIVITY_ID")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "ACTIVITY_PARTICIPANT"
      ADD CONSTRAINT "FK_ACTIVITY_PARTICIPANT_STUDENT"
      FOREIGN KEY ("STUDENT_ID") REFERENCES "STUDENT"("STUDENT_ID")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ACTIVITY_PARTICIPANT" DROP CONSTRAINT "FK_ACTIVITY_PARTICIPANT_STUDENT"`
    )
    await queryRunner.query(
      `ALTER TABLE "ACTIVITY_PARTICIPANT" DROP CONSTRAINT "FK_ACTIVITY_PARTICIPANT_ACTIVITY"`
    )
    await queryRunner.query(`DROP TABLE "ACTIVITY_PARTICIPANT"`)
    await queryRunner.query(`DROP TABLE "ACTIVITY"`)
    await queryRunner.query(`DROP TYPE "public"."ACTIVITY_PARTICIPANT_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."ACTIVITY_status_enum"`)
  }
}
