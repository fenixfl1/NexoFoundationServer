import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754597298512 implements MigrationInterface {
    name = 'Migration1754597298512'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "REFERENCE" ALTER COLUMN "NOMBRE" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "REFERENCE" ALTER COLUMN "NOMBRE" SET DEFAULT 'José Jimenez'`);
    }

}
