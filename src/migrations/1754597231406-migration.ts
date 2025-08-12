import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754597231406 implements MigrationInterface {
    name = 'Migration1754597231406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "REFERENCE" ADD "NOMBRE" character varying NOT NULL DEFAULT 'José Jimenez'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "REFERENCE" DROP COLUMN "NOMBRE"`);
    }

}
