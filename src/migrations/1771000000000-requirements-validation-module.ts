import { MigrationInterface, QueryRunner } from 'typeorm'

export class RequirementsValidationModule1771000000000
  implements MigrationInterface
{
  name = 'RequirementsValidationModule1771000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "REQUIREMENT" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "REQUIREMENT_ID" SERIAL NOT NULL,
        "REQUIREMENT_KEY" character varying(100) NOT NULL,
        "NAME" character varying(150) NOT NULL,
        "DESCRIPTION" text,
        "IS_REQUIRED" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_REQUIREMENT" PRIMARY KEY ("REQUIREMENT_ID"),
        CONSTRAINT "UQ_REQUIREMENT_KEY" UNIQUE ("REQUIREMENT_KEY")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "STUDENT_REQUIREMENT" (
        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
        "CREATED_BY" integer,
        "STATE" character(1) DEFAULT 'A',
        "STUDENT_REQUIREMENT_ID" SERIAL NOT NULL,
        "STUDENT_ID" integer NOT NULL,
        "REQUIREMENT_ID" integer NOT NULL,
        "STATUS" character(1) NOT NULL DEFAULT 'P',
        "OBSERVATION" text,
        "VALIDATED_BY" integer,
        "VALIDATED_AT" TIMESTAMP,
        CONSTRAINT "PK_STUDENT_REQUIREMENT" PRIMARY KEY ("STUDENT_REQUIREMENT_ID"),
        CONSTRAINT "UQ_STUDENT_REQUIREMENT" UNIQUE ("STUDENT_ID", "REQUIREMENT_ID")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "STUDENT_REQUIREMENT"
      ADD CONSTRAINT "FK_STUDENT_REQUIREMENT_STUDENT"
      FOREIGN KEY ("STUDENT_ID") REFERENCES "STUDENT"("STUDENT_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "STUDENT_REQUIREMENT"
      ADD CONSTRAINT "FK_STUDENT_REQUIREMENT_REQUIREMENT"
      FOREIGN KEY ("REQUIREMENT_ID") REFERENCES "REQUIREMENT"("REQUIREMENT_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "STUDENT_REQUIREMENT"
      ADD CONSTRAINT "FK_STUDENT_REQUIREMENT_VALIDATED_BY"
      FOREIGN KEY ("VALIDATED_BY") REFERENCES "USER"("USER_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "STUDENT_REQUIREMENT" DROP CONSTRAINT "FK_STUDENT_REQUIREMENT_VALIDATED_BY"`
    )
    await queryRunner.query(
      `ALTER TABLE "STUDENT_REQUIREMENT" DROP CONSTRAINT "FK_STUDENT_REQUIREMENT_REQUIREMENT"`
    )
    await queryRunner.query(
      `ALTER TABLE "STUDENT_REQUIREMENT" DROP CONSTRAINT "FK_STUDENT_REQUIREMENT_STUDENT"`
    )
    await queryRunner.query(`DROP TABLE "STUDENT_REQUIREMENT"`)
    await queryRunner.query(`DROP TABLE "REQUIREMENT"`)
  }
}
