import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1770433907714 implements MigrationInterface {
  name = 'Migration1770433907714'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PERSON" ADD "PERSON_TYPE" character varying`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PERSON" DROP COLUMN "PERSON_TYPE"`)
  }
}
