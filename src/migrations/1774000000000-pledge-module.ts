import { MigrationInterface, QueryRunner } from 'typeorm'

export class PledgeModule1774000000000 implements MigrationInterface {
  name = 'PledgeModule1774000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "PLEDGE" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "PLEDGE_ID" SERIAL NOT NULL,
        "SPONSOR_ID" integer NOT NULL,
        "NAME" character varying(150) NOT NULL,
        "DESCRIPTION" text,
        "AMOUNT" numeric(12,2) NOT NULL,
        "START_DATE" date NOT NULL,
        "END_DATE" date,
        "FREQUENCY" character varying(30),
        "STATUS" character(1) NOT NULL DEFAULT 'P',
        "NOTES" text,
        CONSTRAINT "PK_PLEDGE" PRIMARY KEY ("PLEDGE_ID")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "PLEDGE"
      ADD CONSTRAINT "FK_PLEDGE_SPONSOR"
      FOREIGN KEY ("SPONSOR_ID") REFERENCES "SPONSOR"("SPONSOR_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PLEDGE" DROP CONSTRAINT "FK_PLEDGE_SPONSOR"`
    )
    await queryRunner.query(`DROP TABLE "PLEDGE"`)
  }
}
