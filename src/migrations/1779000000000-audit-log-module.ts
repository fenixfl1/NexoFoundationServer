import { MigrationInterface, QueryRunner } from 'typeorm'

export class AuditLogModule1779000000000 implements MigrationInterface {
  name = 'AuditLogModule1779000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "AUDIT_LOG" (
        "AUDIT_LOG_ID" SERIAL NOT NULL,
        "ACTION_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "USER_ID" integer NOT NULL,
        "ENTITY_TYPE" character varying(100) NOT NULL,
        "ENTITY_ID" character varying(100),
        "ENTITY_LABEL" character varying(200) NOT NULL,
        "ACTION" character(1) NOT NULL,
        "MESSAGE" text,
        "PAYLOAD" jsonb,
        "IP_ADDRESS" character varying(45),
        "USER_AGENT" character varying(255),
        CONSTRAINT "PK_AUDIT_LOG" PRIMARY KEY ("AUDIT_LOG_ID"),
        CONSTRAINT "CK_AUDIT_LOG_ACTION"
          CHECK ("ACTION" IN ('C','U','D','V','L')),
        CONSTRAINT "FK_AUDIT_LOG_USER"
          FOREIGN KEY ("USER_ID") REFERENCES "USER"("USER_ID")
          ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_AUDIT_LOG_USER" ON "AUDIT_LOG" ("USER_ID")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_AUDIT_LOG_ENTITY" ON "AUDIT_LOG" ("ENTITY_TYPE")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_AUDIT_LOG_ACTION_AT" ON "AUDIT_LOG" ("ACTION_AT")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_AUDIT_LOG_ACTION_AT"`)
    await queryRunner.query(`DROP INDEX "IDX_AUDIT_LOG_ENTITY"`)
    await queryRunner.query(`DROP INDEX "IDX_AUDIT_LOG_USER"`)
    await queryRunner.query(`DROP TABLE "AUDIT_LOG"`)
  }
}
