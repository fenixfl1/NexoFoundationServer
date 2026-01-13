import { MigrationInterface, QueryRunner } from 'typeorm'

export class ScholarshipCostHistoryModule1775000000000
  implements MigrationInterface
{
  name = 'ScholarshipCostHistoryModule1775000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SCHOLARSHIP"
      ADD COLUMN "PERIOD_TYPE" character(1) DEFAULT 'S'
    `)

    await queryRunner.query(`
      CREATE TABLE "SCHOLARSHIP_COST_HISTORY" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "COST_ID" SERIAL NOT NULL,
        "SCHOLARSHIP_ID" integer NOT NULL,
        "PERIOD_TYPE" character(1) NOT NULL,
        "PERIOD_LABEL" character varying(30) NOT NULL,
        "PERIOD_START" date NOT NULL,
        "PERIOD_END" date NOT NULL,
        "AMOUNT" numeric(12,2) NOT NULL,
        "STATUS" character(1) NOT NULL DEFAULT 'P',
        "NOTES" text,
        CONSTRAINT "PK_SCHOLARSHIP_COST_HISTORY" PRIMARY KEY ("COST_ID"),
        CONSTRAINT "UQ_SCHOLARSHIP_COST_UNIQUE" UNIQUE ("SCHOLARSHIP_ID", "PERIOD_LABEL")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "SCHOLARSHIP_COST_HISTORY"
      ADD CONSTRAINT "FK_COST_HISTORY_SCHOLARSHIP"
      FOREIGN KEY ("SCHOLARSHIP_ID") REFERENCES "SCHOLARSHIP"("SCHOLARSHIP_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "DISBURSEMENT"
      ADD COLUMN "COST_ID" integer
    `)

    await queryRunner.query(`
      ALTER TABLE "DISBURSEMENT"
      ADD CONSTRAINT "FK_DISBURSEMENT_COST_HISTORY"
      FOREIGN KEY ("COST_ID") REFERENCES "SCHOLARSHIP_COST_HISTORY"("COST_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "DISBURSEMENT" DROP CONSTRAINT "FK_DISBURSEMENT_COST_HISTORY"`
    )
    await queryRunner.query(
      `ALTER TABLE "DISBURSEMENT" DROP COLUMN "COST_ID"`
    )
    await queryRunner.query(
      `ALTER TABLE "SCHOLARSHIP_COST_HISTORY" DROP CONSTRAINT "FK_COST_HISTORY_SCHOLARSHIP"`
    )
    await queryRunner.query(`DROP TABLE "SCHOLARSHIP_COST_HISTORY"`)
    await queryRunner.query(
      `ALTER TABLE "SCHOLARSHIP" DROP COLUMN "PERIOD_TYPE"`
    )
  }
}
