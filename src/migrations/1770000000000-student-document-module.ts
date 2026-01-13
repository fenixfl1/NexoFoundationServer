import { MigrationInterface, QueryRunner } from 'typeorm'

export class StudentDocumentModule1770000000000 implements MigrationInterface {
  name = 'StudentDocumentModule1770000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "STUDENT_DOCUMENT" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "DOCUMENT_ID" SERIAL NOT NULL,
        "STUDENT_ID" integer NOT NULL,
        "DOCUMENT_TYPE" character varying(100) NOT NULL,
        "FILE_NAME" character varying(255) NOT NULL,
        "MIME_TYPE" character varying(100) NOT NULL,
        "FILE_BASE64" text NOT NULL,
        "SIGNED_BASE64" text,
        "SIGNED_AT" TIMESTAMP,
        "DESCRIPTION" text,
        CONSTRAINT "PK_STUDENT_DOCUMENT" PRIMARY KEY ("DOCUMENT_ID")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "STUDENT_DOCUMENT"
      ADD CONSTRAINT "FK_STUDENT_DOCUMENT_STUDENT"
      FOREIGN KEY ("STUDENT_ID") REFERENCES "STUDENT"("STUDENT_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "STUDENT_DOCUMENT" DROP CONSTRAINT "FK_STUDENT_DOCUMENT_STUDENT"`
    )
    await queryRunner.query(`DROP TABLE "STUDENT_DOCUMENT"`)
  }
}
