import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754597435621 implements MigrationInterface {
    name = 'Migration1754597435621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "REFERENCE" RENAME COLUMN "NOMBRE" TO "NAME"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "REFERENCE" RENAME COLUMN "NAME" TO "NOMBRE"`);
    }

}
