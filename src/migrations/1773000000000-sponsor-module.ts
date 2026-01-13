import { MigrationInterface, QueryRunner } from 'typeorm'

export class SponsorModule1773000000000 implements MigrationInterface {
  name = 'SponsorModule1773000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "SPONSOR" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "SPONSOR_ID" SERIAL NOT NULL,
        "NAME" character varying(150) NOT NULL,
        "TYPE" character varying(50),
        "TAX_ID" character varying(30),
        "CONTACT_NAME" character varying(150),
        "CONTACT_EMAIL" character varying(150),
        "CONTACT_PHONE" character varying(30),
        "ADDRESS" text,
        "NOTES" text,
        CONSTRAINT "PK_SPONSOR" PRIMARY KEY ("SPONSOR_ID")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "SPONSOR"`)
  }
}
