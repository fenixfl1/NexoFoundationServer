import { MigrationInterface, QueryRunner } from 'typeorm'

export class ScholarshipModule1772000000000 implements MigrationInterface {
  name = 'ScholarshipModule1772000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "SCHOLARSHIP" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "SCHOLARSHIP_ID" SERIAL NOT NULL,
        "STUDENT_ID" integer NOT NULL,
        "REQUEST_ID" integer,
        "NAME" character varying(150) NOT NULL,
        "DESCRIPTION" text,
        "AMOUNT" numeric(12,2) NOT NULL,
        "START_DATE" date NOT NULL,
        "END_DATE" date,
        "STATUS" character(1) NOT NULL DEFAULT 'P',
        CONSTRAINT "PK_SCHOLARSHIP" PRIMARY KEY ("SCHOLARSHIP_ID")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "DISBURSEMENT" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "DISBURSEMENT_ID" SERIAL NOT NULL,
        "SCHOLARSHIP_ID" integer NOT NULL,
        "AMOUNT" numeric(12,2) NOT NULL,
        "DISBURSEMENT_DATE" date NOT NULL,
        "METHOD" character varying(50),
        "REFERENCE" character varying(100),
        "STATUS" character(1) NOT NULL DEFAULT 'P',
        "NOTES" text,
        CONSTRAINT "PK_DISBURSEMENT" PRIMARY KEY ("DISBURSEMENT_ID")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "SCHOLARSHIP"
      ADD CONSTRAINT "FK_SCHOLARSHIP_STUDENT"
      FOREIGN KEY ("STUDENT_ID") REFERENCES "STUDENT"("STUDENT_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "SCHOLARSHIP"
      ADD CONSTRAINT "FK_SCHOLARSHIP_REQUEST"
      FOREIGN KEY ("REQUEST_ID") REFERENCES "REQUEST"("REQUEST_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "DISBURSEMENT"
      ADD CONSTRAINT "FK_DISBURSEMENT_SCHOLARSHIP"
      FOREIGN KEY ("SCHOLARSHIP_ID") REFERENCES "SCHOLARSHIP"("SCHOLARSHIP_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "DISBURSEMENT" DROP CONSTRAINT "FK_DISBURSEMENT_SCHOLARSHIP"`
    )
    await queryRunner.query(
      `ALTER TABLE "SCHOLARSHIP" DROP CONSTRAINT "FK_SCHOLARSHIP_REQUEST"`
    )
    await queryRunner.query(
      `ALTER TABLE "SCHOLARSHIP" DROP CONSTRAINT "FK_SCHOLARSHIP_STUDENT"`
    )
    await queryRunner.query(`DROP TABLE "DISBURSEMENT"`)
    await queryRunner.query(`DROP TABLE "SCHOLARSHIP"`)
  }
}
