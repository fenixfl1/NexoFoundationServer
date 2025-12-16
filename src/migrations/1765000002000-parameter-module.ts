import { MigrationInterface, QueryRunner } from 'typeorm'

export class ParameterModule1765000002000 implements MigrationInterface {
  name = 'ParameterModule1765000002000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "PARAMETER" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "PARAMETER_ID" SERIAL NOT NULL,
        "PARAMETER" character varying(150) NOT NULL,
        "DESCRIPTION" character varying(255),
        "VALUE" text,
        "MENU_OPTION_ID" character varying(50) NOT NULL,
        CONSTRAINT "PK_PARAMETER" PRIMARY KEY ("PARAMETER_ID"),
        CONSTRAINT "UQ_PARAMETER_MENU_OPTION" UNIQUE ("MENU_OPTION_ID", "PARAMETER")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "PARAMETER"
      ADD CONSTRAINT "FK_PARAMETER_MENU_OPTION"
      FOREIGN KEY ("MENU_OPTION_ID") REFERENCES "MENU_OPTION" ("MENU_OPTION_ID")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PARAMETER" DROP CONSTRAINT "FK_PARAMETER_MENU_OPTION"`
    )
    await queryRunner.query(`DROP TABLE "PARAMETER"`)
  }
}
