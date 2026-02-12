import { MigrationInterface, QueryRunner } from 'typeorm'

export class PersonOptionalFields1782000000000 implements MigrationInterface {
  name = 'PersonOptionalFields1782000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PERSON" ALTER COLUMN "LAST_NAME" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "PERSON" ALTER COLUMN "GENDER" DROP NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "PERSON" ADD COLUMN "DOCUMENT_TYPE" character varying`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PERSON" DROP COLUMN "DOCUMENT_TYPE"`)
    await queryRunner.query(`ALTER TABLE "PERSON" ALTER COLUMN "LAST_NAME" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "PERSON" ALTER COLUMN "GENDER" SET NOT NULL`)
  }
}
