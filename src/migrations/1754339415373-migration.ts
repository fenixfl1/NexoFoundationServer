import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754339415373 implements MigrationInterface {
    name = 'Migration1754339415373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "USER" ADD CONSTRAINT "UQ_32060ff68c49165df39813b40b7" UNIQUE ("PERSON_ID")`);
        await queryRunner.query(`ALTER TYPE "public"."MENU_OPTION_type_enum" RENAME TO "MENU_OPTION_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."MENU_OPTION_type_enum" AS ENUM('group', 'divider', 'link', 'item', 'submenu')`);
        await queryRunner.query(`ALTER TABLE "MENU_OPTION" ALTER COLUMN "TYPE" TYPE "public"."MENU_OPTION_type_enum" USING "TYPE"::"text"::"public"."MENU_OPTION_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."MENU_OPTION_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "USER" ADD CONSTRAINT "FK_32060ff68c49165df39813b40b7" FOREIGN KEY ("PERSON_ID") REFERENCES "PERSON"("PERSON_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "USER" DROP CONSTRAINT "FK_32060ff68c49165df39813b40b7"`);
        await queryRunner.query(`CREATE TYPE "public"."MENU_OPTION_type_enum_old" AS ENUM('group', 'divider', 'link')`);
        await queryRunner.query(`ALTER TABLE "MENU_OPTION" ALTER COLUMN "TYPE" TYPE "public"."MENU_OPTION_type_enum_old" USING "TYPE"::"text"::"public"."MENU_OPTION_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."MENU_OPTION_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."MENU_OPTION_type_enum_old" RENAME TO "MENU_OPTION_type_enum"`);
        await queryRunner.query(`ALTER TABLE "USER" DROP CONSTRAINT "UQ_32060ff68c49165df39813b40b7"`);
    }

}
