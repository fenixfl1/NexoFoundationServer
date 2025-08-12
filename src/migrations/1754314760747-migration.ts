import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754314760747 implements MigrationInterface {
    name = 'Migration1754314760747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ROLES_X_USER" DROP CONSTRAINT "FK_edeec0a0e0777511420bf2a6f84"`);
        await queryRunner.query(`ALTER TABLE "USER" ADD "AVATAR" text`);
        await queryRunner.query(`ALTER TABLE "USER" DROP CONSTRAINT "PK_465d4c94df6d27eab8b11e0e32a"`);
        await queryRunner.query(`ALTER TABLE "USER" ADD CONSTRAINT "PK_83bc997badef7070d50845f1e9b" PRIMARY KEY ("USER_ID")`);
        await queryRunner.query(`ALTER TABLE "ROLES_X_USER" ADD CONSTRAINT "FK_6014c0ac471a029270386464b0e" FOREIGN KEY ("USER_ID") REFERENCES "USER"("USER_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ROLES_X_USER" DROP CONSTRAINT "FK_6014c0ac471a029270386464b0e"`);
        await queryRunner.query(`ALTER TABLE "USER" DROP CONSTRAINT "PK_83bc997badef7070d50845f1e9b"`);
        await queryRunner.query(`ALTER TABLE "USER" ADD CONSTRAINT "PK_465d4c94df6d27eab8b11e0e32a" PRIMARY KEY ("USER_ID", "PERSON_ID")`);
        await queryRunner.query(`ALTER TABLE "USER" DROP COLUMN "AVATAR"`);
        await queryRunner.query(`ALTER TABLE "ROLES_X_USER" ADD CONSTRAINT "FK_edeec0a0e0777511420bf2a6f84" FOREIGN KEY ("USER_ID", "USER_ID") REFERENCES "USER"("USER_ID","PERSON_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
