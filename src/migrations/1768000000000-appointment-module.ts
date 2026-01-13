import { MigrationInterface, QueryRunner } from 'typeorm'

export class AppointmentModule1768000000000 implements MigrationInterface {
  name = 'AppointmentModule1768000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."APPOINTMENT_status_enum" AS ENUM (
        'scheduled',
        'completed',
        'cancelled'
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "APPOINTMENT" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "APPOINTMENT_ID" SERIAL NOT NULL,
        "PERSON_ID" integer NOT NULL,
        "REQUEST_ID" integer,
        "STUDENT_ID" integer,
        "TITLE" character varying(150) NOT NULL,
        "DESCRIPTION" text,
        "START_AT" TIMESTAMP NOT NULL,
        "END_AT" TIMESTAMP,
        "LOCATION" character varying(150),
        "STATUS" "public"."APPOINTMENT_status_enum" NOT NULL DEFAULT 'scheduled',
        "NOTES" character varying(255),
        CONSTRAINT "PK_APPOINTMENT" PRIMARY KEY ("APPOINTMENT_ID")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "APPOINTMENT"
      ADD CONSTRAINT "FK_APPOINTMENT_PERSON"
      FOREIGN KEY ("PERSON_ID") REFERENCES "PERSON"("PERSON_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "APPOINTMENT"
      ADD CONSTRAINT "FK_APPOINTMENT_REQUEST"
      FOREIGN KEY ("REQUEST_ID") REFERENCES "REQUEST"("REQUEST_ID")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "APPOINTMENT"
      ADD CONSTRAINT "FK_APPOINTMENT_STUDENT"
      FOREIGN KEY ("STUDENT_ID") REFERENCES "STUDENT"("STUDENT_ID")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "APPOINTMENT" DROP CONSTRAINT "FK_APPOINTMENT_STUDENT"`
    )
    await queryRunner.query(
      `ALTER TABLE "APPOINTMENT" DROP CONSTRAINT "FK_APPOINTMENT_REQUEST"`
    )
    await queryRunner.query(
      `ALTER TABLE "APPOINTMENT" DROP CONSTRAINT "FK_APPOINTMENT_PERSON"`
    )
    await queryRunner.query(`DROP TABLE "APPOINTMENT"`)
    await queryRunner.query(`DROP TYPE "public"."APPOINTMENT_status_enum"`)
  }
}
