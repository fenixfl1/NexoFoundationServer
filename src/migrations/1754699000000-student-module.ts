import { MigrationInterface, QueryRunner } from 'typeorm'

export class StudentModule1754699000000 implements MigrationInterface {
  name = 'StudentModule1754699000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."STUDENT_scholarship_status_enum" AS ENUM (
        'pending',
        'active',
        'suspended',
        'completed',
        'graduated'
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "STUDENT" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "STUDENT_ID" SERIAL NOT NULL,
        "PERSON_ID" integer NOT NULL,
        "UNIVERSITY" character varying(150) NOT NULL,
        "CAREER" character varying(150) NOT NULL,
        "SCHOLARSHIP_STATUS" "public"."STUDENT_scholarship_status_enum" NOT NULL DEFAULT 'pending',
        "ACADEMIC_AVERAGE" numeric(3,2) NOT NULL DEFAULT '0',
        "HOURS_REQUIRED" integer NOT NULL DEFAULT 0,
        "HOURS_COMPLETED" integer NOT NULL DEFAULT 0,
        "LAST_FOLLOW_UP" TIMESTAMP,
        "NEXT_APPOINTMENT" TIMESTAMP,
        "COHORT" character varying(100),
        "CAMPUS" character varying(150),
        "SCORE" integer,
        CONSTRAINT "PK_STUDENT" PRIMARY KEY ("STUDENT_ID")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "STUDENT"
      ADD CONSTRAINT "FK_STUDENT_PERSON"
      FOREIGN KEY ("PERSON_ID")
      REFERENCES "PERSON" ("PERSON_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "STUDENT" DROP CONSTRAINT "FK_STUDENT_PERSON"`
    )
    await queryRunner.query(`DROP TABLE "STUDENT"`)
    await queryRunner.query(
      `DROP TYPE "public"."STUDENT_scholarship_status_enum"`
    )
  }
}
