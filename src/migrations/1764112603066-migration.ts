import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1764112603066 implements MigrationInterface {
    name = 'Migration1764112603066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "PASSWORD_RESET_TOKENS" ("ID" SERIAL NOT NULL, "TOKEN" character varying NOT NULL, "EXPIRES_AT" TIMESTAMP NOT NULL, "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "USER_ID" integer, CONSTRAINT "PK_f2a4bd2d317f2efb4b62c53aedb" PRIMARY KEY ("ID"))`);
        await queryRunner.query(`ALTER TABLE "PASSWORD_RESET_TOKENS" ADD CONSTRAINT "FK_a0bd4aa2532b34b785edc6d0e71" FOREIGN KEY ("USER_ID") REFERENCES "USER"("USER_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "PASSWORD_RESET_TOKENS" DROP CONSTRAINT "FK_a0bd4aa2532b34b785edc6d0e71"`);
        await queryRunner.query(`DROP TABLE "PASSWORD_RESET_TOKENS"`);
    }

}
