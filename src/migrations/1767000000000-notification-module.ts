import { MigrationInterface, QueryRunner } from 'typeorm'

export class NotificationModule1767000000000 implements MigrationInterface {
  name = 'NotificationModule1767000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."NOTIFICATION_channel_enum" AS ENUM (
        'email',
        'sms',
        'in_app',
        'push',
        'whatsapp'
      )
    `)

    await queryRunner.query(`
      CREATE TYPE "public"."NOTIFICATION_status_enum" AS ENUM ('P', 'C', 'S', 'F')
    `)

    await queryRunner.query(`
      CREATE TABLE "NOTIFICATION_TEMPLATE" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "TEMPLATE_ID" SERIAL NOT NULL,
        "TEMPLATE_KEY" character varying(150) NOT NULL,
        "NAME" character varying(150) NOT NULL,
        "DESCRIPTION" text,
        "CHANNEL" "public"."NOTIFICATION_channel_enum" NOT NULL,
        "SUBJECT" character varying(255),
        "BODY" text NOT NULL,
        "PARAMETERS" jsonb,
        "DEFAULTS" jsonb,
        "MENU_OPTION_ID" character varying(50),
        CONSTRAINT "PK_NOTIFICATION_TEMPLATE" PRIMARY KEY ("TEMPLATE_ID"),
        CONSTRAINT "UQ_NOTIFICATION_TEMPLATE_KEY" UNIQUE ("TEMPLATE_KEY")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "NOTIFICATION" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "NOTIFICATION_ID" SERIAL NOT NULL,
        "TEMPLATE_ID" integer,
        "CHANNEL" "public"."NOTIFICATION_channel_enum" NOT NULL,
        "RECIPIENT" character varying(255) NOT NULL,
        "SUBJECT" character varying(255),
        "BODY" text NOT NULL,
        "PAYLOAD" jsonb,
        "STATUS" "public"."NOTIFICATION_status_enum" NOT NULL DEFAULT 'P',
        "RELATED_ENTITY" character varying(100),
        "RELATED_ID" character varying(100),
        "SCHEDULED_AT" TIMESTAMP,
        "SENT_AT" TIMESTAMP,
        "SENT_BY" integer,
        "ERROR_MESSAGE" text,
        CONSTRAINT "PK_NOTIFICATION" PRIMARY KEY ("NOTIFICATION_ID")
      )
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_NOTIFICATION_STATUS" ON "NOTIFICATION" ("STATUS")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_NOTIFICATION_TEMPLATE" ON "NOTIFICATION" ("TEMPLATE_ID")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_NOTIFICATION_RELATED" ON "NOTIFICATION" ("RELATED_ENTITY", "RELATED_ID")
    `)

    await queryRunner.query(`
      ALTER TABLE "NOTIFICATION_TEMPLATE"
      ADD CONSTRAINT "FK_NOTIFICATION_TEMPLATE_MENU_OPTION"
      FOREIGN KEY ("MENU_OPTION_ID") REFERENCES "MENU_OPTION" ("MENU_OPTION_ID")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "NOTIFICATION"
      ADD CONSTRAINT "FK_NOTIFICATION_TEMPLATE"
      FOREIGN KEY ("TEMPLATE_ID") REFERENCES "NOTIFICATION_TEMPLATE" ("TEMPLATE_ID")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "NOTIFICATION"
      ADD CONSTRAINT "FK_NOTIFICATION_SENT_BY_USER"
      FOREIGN KEY ("SENT_BY") REFERENCES "USER" ("USER_ID")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "NOTIFICATION" DROP CONSTRAINT "FK_NOTIFICATION_SENT_BY_USER"
    `)

    await queryRunner.query(`
      ALTER TABLE "NOTIFICATION" DROP CONSTRAINT "FK_NOTIFICATION_TEMPLATE"
    `)

    await queryRunner.query(`
      ALTER TABLE "NOTIFICATION_TEMPLATE" DROP CONSTRAINT "FK_NOTIFICATION_TEMPLATE_MENU_OPTION"
    `)

    await queryRunner.query(`DROP INDEX "IDX_NOTIFICATION_RELATED"`)
    await queryRunner.query(`DROP INDEX "IDX_NOTIFICATION_TEMPLATE"`)
    await queryRunner.query(`DROP INDEX "IDX_NOTIFICATION_STATUS"`)

    await queryRunner.query(`DROP TABLE "NOTIFICATION"`)
    await queryRunner.query(`DROP TABLE "NOTIFICATION_TEMPLATE"`)

    await queryRunner.query(`DROP TYPE "public"."NOTIFICATION_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."NOTIFICATION_channel_enum"`)
  }
}
