import { MigrationInterface, QueryRunner } from 'typeorm'

export class RequestModule1765001500000 implements MigrationInterface {
  name = 'RequestModule1765001500000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."REQUEST_status_enum" AS ENUM (
        'new',
        'in_review',
        'approved',
        'rejected',
        'scheduled'
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "REQUEST" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "REQUEST_ID" SERIAL NOT NULL,
        "PERSON_ID" integer NOT NULL,
        "STUDENT_ID" integer,
        "REQUEST_TYPE" character varying(100) NOT NULL,
        "STATUS" "public"."REQUEST_status_enum" NOT NULL DEFAULT 'new',
        "ASSIGNED_COORDINATOR" character varying(150),
        "NEXT_APPOINTMENT" TIMESTAMP,
        "COHORT" character varying(100),
        "NOTES" text,
        CONSTRAINT "PK_REQUEST" PRIMARY KEY ("REQUEST_ID")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "REQUEST"
      ADD CONSTRAINT "FK_REQUEST_PERSON"
      FOREIGN KEY ("PERSON_ID") REFERENCES "PERSON"("PERSON_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "REQUEST"
      ADD CONSTRAINT "FK_REQUEST_STUDENT"
      FOREIGN KEY ("STUDENT_ID") REFERENCES "STUDENT"("STUDENT_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "REQUEST" DROP CONSTRAINT "FK_REQUEST_STUDENT"`
    )
    await queryRunner.query(
      `ALTER TABLE "REQUEST" DROP CONSTRAINT "FK_REQUEST_PERSON"`
    )
    await queryRunner.query(`DROP TABLE "REQUEST"`)
    await queryRunner.query(`DROP TYPE "public"."REQUEST_status_enum"`)
  }
}
