import { MigrationInterface, QueryRunner } from 'typeorm'

export class TermModule1780000000000 implements MigrationInterface {
  name = 'TermModule1780000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."COURSE_GRADE_status_enum" AS ENUM (
        'passed',
        'failed',
        'in_progress'
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "TERM" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "TERM_ID" SERIAL NOT NULL,
        "STUDENT_ID" integer NOT NULL,
        "PERIOD" character varying(20) NOT NULL,
        "TERM_INDEX" numeric(4,2) NOT NULL DEFAULT 0,
        "TOTAL_CREDITS" integer NOT NULL DEFAULT 0,
        "CAPTURE_FILE_NAME" character varying(255),
        "CAPTURE_MIME_TYPE" character varying(100),
        "CAPTURE_BASE64" text,
        "OBSERVATIONS" text,
        CONSTRAINT "PK_TERM" PRIMARY KEY ("TERM_ID")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "COURSE_GRADE" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "COURSE_GRADE_ID" SERIAL NOT NULL,
        "TERM_ID" integer NOT NULL,
        "COURSE_NAME" character varying(150) NOT NULL,
        "GRADE" numeric(4,2) NOT NULL,
        "CREDITS" numeric(4,1) NOT NULL DEFAULT 0,
        "STATUS" "public"."COURSE_GRADE_status_enum" NOT NULL DEFAULT 'in_progress',
        CONSTRAINT "PK_COURSE_GRADE" PRIMARY KEY ("COURSE_GRADE_ID")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "TERM"
      ADD CONSTRAINT "FK_TERM_STUDENT" FOREIGN KEY ("STUDENT_ID")
      REFERENCES "STUDENT"("STUDENT_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "COURSE_GRADE"
      ADD CONSTRAINT "FK_COURSE_GRADE_TERM" FOREIGN KEY ("TERM_ID")
      REFERENCES "TERM"("TERM_ID")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "COURSE_GRADE" DROP CONSTRAINT "FK_COURSE_GRADE_TERM"`
    )
    await queryRunner.query(
      `ALTER TABLE "TERM" DROP CONSTRAINT "FK_TERM_STUDENT"`
    )
    await queryRunner.query(`DROP TABLE "COURSE_GRADE"`)
    await queryRunner.query(`DROP TABLE "TERM"`)
    await queryRunner.query(`DROP TYPE "public"."COURSE_GRADE_status_enum"`)
  }
}
