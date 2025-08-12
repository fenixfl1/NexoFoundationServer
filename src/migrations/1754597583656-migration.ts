import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754597583656 implements MigrationInterface {
    name = 'Migration1754597583656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "REFERENCE" ALTER COLUMN "EMAIL" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "REFERENCE" ALTER COLUMN "ADDRESS" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "REFERENCE" ALTER COLUMN "NOTES" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "REFERENCE" ALTER COLUMN "NOTES" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "REFERENCE" ALTER COLUMN "ADDRESS" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "REFERENCE" ALTER COLUMN "EMAIL" SET NOT NULL`);
    }

}
