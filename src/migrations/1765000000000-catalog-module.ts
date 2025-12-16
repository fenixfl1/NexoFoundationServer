import { MigrationInterface, QueryRunner } from 'typeorm'

export class CatalogModule1765000000000 implements MigrationInterface {
  name = 'CatalogModule1765000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "CATALOG" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "CATALOG_ID" SERIAL NOT NULL,
        "KEY" character varying(100) NOT NULL,
        "NAME" character varying(150) NOT NULL,
        "DESCRIPTION" character varying(255),
        CONSTRAINT "PK_CATALOG" PRIMARY KEY ("CATALOG_ID"),
        CONSTRAINT "UQ_CATALOG_KEY" UNIQUE ("KEY")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "CATALOG_ITEM" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "ITEM_ID" SERIAL NOT NULL,
        "CATALOG_ID" integer NOT NULL,
        "VALUE" character varying(100) NOT NULL,
        "LABEL" character varying(200) NOT NULL,
        "ORDER" integer NOT NULL DEFAULT 0,
        "EXTRA" json,
        CONSTRAINT "PK_CATALOG_ITEM" PRIMARY KEY ("ITEM_ID"),
        CONSTRAINT "UQ_CATALOG_ITEM_VALUE" UNIQUE ("CATALOG_ID", "VALUE")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "CATALOG_ITEM"
      ADD CONSTRAINT "FK_CATALOG_ITEM_CATALOG"
      FOREIGN KEY ("CATALOG_ID") REFERENCES "CATALOG" ("CATALOG_ID")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "CATALOG_ITEM" DROP CONSTRAINT "FK_CATALOG_ITEM_CATALOG"`
    )
    await queryRunner.query(`DROP TABLE "CATALOG_ITEM"`)
    await queryRunner.query(`DROP TABLE "CATALOG"`)
  }
}
