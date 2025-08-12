import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754598010384 implements MigrationInterface {
    name = 'Migration1754598010384'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "REFERENCE" RENAME COLUMN "NAME" TO "FULL_NAME"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "REFERENCE" RENAME COLUMN "FULL_NAME" TO "NAME"`);
    }

}
