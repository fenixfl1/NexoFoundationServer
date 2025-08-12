import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754266170694 implements MigrationInterface {
    name = 'Migration1754266170694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "REFERENCE" ("REFERENCE_ID" SERIAL NOT NULL, "PERSON_ID" integer NOT NULL, "RELATIONSHIP" character varying NOT NULL, "PHONE" character varying NOT NULL, "EMAIL" character varying NOT NULL, "ADDRESS" character varying(255) NOT NULL, "NOTES" character varying(500) NOT NULL, CONSTRAINT "PK_92aff10276e579b1080a24449b9" PRIMARY KEY ("REFERENCE_ID"))`);
        await queryRunner.query(`CREATE TYPE "public"."CONTACT_type_enum" AS ENUM('email', 'phone', 'whatsapp', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."CONTACT_usage_enum" AS ENUM('personal', 'institutional', 'emergency')`);
        await queryRunner.query(`CREATE TABLE "CONTACT" ("CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "CREATED_BY" integer, "STATE" character(1) NOT NULL DEFAULT 'A', "CONTACT_ID" SERIAL NOT NULL, "PERSON_ID" integer NOT NULL, "TYPE" "public"."CONTACT_type_enum" NOT NULL DEFAULT 'email', "USAGE" "public"."CONTACT_usage_enum" NOT NULL DEFAULT 'personal', "VALUE" character varying(255) NOT NULL, "IS_PRIMARY" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_823580c7d4d521ccf9cd58cbb16" PRIMARY KEY ("CONTACT_ID"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_741e323799d657b06d86ca98cb" ON "CONTACT" ("PERSON_ID", "TYPE", "USAGE", "VALUE") `);
        await queryRunner.query(`CREATE TABLE "PERSON" ("CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "CREATED_BY" integer, "STATE" character(1) NOT NULL DEFAULT 'A', "PERSON_ID" SERIAL NOT NULL, "NAME" character varying NOT NULL, "LAST_NAME" character varying NOT NULL, "GENDER" character NOT NULL, "BIRTH_DATE" date NOT NULL, "IDENTITY_DOCUMENT" character varying NOT NULL, CONSTRAINT "PK_18197183747b37c419fcc02f2f1" PRIMARY KEY ("PERSON_ID"))`);
        await queryRunner.query(`CREATE TABLE "USER" ("CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "CREATED_BY" integer, "STATE" character(1) NOT NULL DEFAULT 'A', "USER_ID" SERIAL NOT NULL, "USERNAME" character varying(25) NOT NULL, "PERSON_ID" integer NOT NULL, "PASSWORD" character varying(255) NOT NULL, CONSTRAINT "UQ_d02ca672152e744cf7ba53d2864" UNIQUE ("USERNAME"), CONSTRAINT "PK_465d4c94df6d27eab8b11e0e32a" PRIMARY KEY ("USER_ID", "PERSON_ID"))`);
        await queryRunner.query(`CREATE TABLE "ROLES_X_USER" ("CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "CREATED_BY" integer, "STATE" character(1) NOT NULL DEFAULT 'A', "USER_ID" integer NOT NULL, "ROLE_ID" integer NOT NULL, CONSTRAINT "PK_27488ae7e50440d4a06b585798b" PRIMARY KEY ("USER_ID", "ROLE_ID"))`);
        await queryRunner.query(`CREATE TABLE "ROLE" ("CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "CREATED_BY" integer, "STATE" character(1) NOT NULL DEFAULT 'A', "ROLE_ID" SERIAL NOT NULL, "NAME" character varying(30) NOT NULL, "DESCRIPTION" character varying(250) NOT NULL, CONSTRAINT "UQ_cfcd3a13b39580bf95cd2ef1b1f" UNIQUE ("NAME"), CONSTRAINT "PK_2464e6137ccbd5f89724b83282e" PRIMARY KEY ("ROLE_ID"))`);
        await queryRunner.query(`CREATE TYPE "public"."MENU_OPTION_type_enum" AS ENUM('group', 'divider', 'link')`);
        await queryRunner.query(`CREATE TABLE "MENU_OPTION" ("CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "CREATED_BY" integer, "STATE" character(1) NOT NULL DEFAULT 'A', "MENU_OPTION_ID" character varying(50) NOT NULL, "NAME" character varying(100) NOT NULL, "DESCRIPTION" character varying(250), "PATH" character varying(100), "TYPE" "public"."MENU_OPTION_type_enum", "ICON" text, "ORDER" integer NOT NULL, "PARENT_ID" character varying, CONSTRAINT "PK_c33923d6f156b267e8e4dfe59c3" PRIMARY KEY ("MENU_OPTION_ID"))`);
        await queryRunner.query(`CREATE TABLE "ACTION" ("CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "CREATED_BY" integer, "STATE" character(1) NOT NULL DEFAULT 'A', "ACTION_ID" SERIAL NOT NULL, "NAME" character varying(255) NOT NULL, "DESCRIPTION" character varying(255), CONSTRAINT "PK_dfc4a3ad12020abd40ef5d092ac" PRIMARY KEY ("ACTION_ID"))`);
        await queryRunner.query(`CREATE TABLE "PERMISSION_X_ROLE" ("CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "CREATED_BY" integer, "STATE" character(1) NOT NULL DEFAULT 'A', "PERMISSION_ID" integer NOT NULL, "ROLE_ID" integer NOT NULL, CONSTRAINT "PK_aba3c897a024c6ba7edf7a47da3" PRIMARY KEY ("PERMISSION_ID", "ROLE_ID"))`);
        await queryRunner.query(`CREATE TABLE "PERMISSION" ("CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "CREATED_BY" integer, "STATE" character(1) NOT NULL DEFAULT 'A', "PERMISSION_ID" SERIAL NOT NULL, "MENU_OPTION_ID" character varying NOT NULL, "ACTION_ID" integer NOT NULL, "DESCRIPTION" character varying(255), CONSTRAINT "PK_7efad0105d237300cbd89505d3d" PRIMARY KEY ("PERMISSION_ID"))`);
        await queryRunner.query(`CREATE TABLE "DEPARTMENT" ("CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "CREATED_BY" integer, "STATE" character(1) NOT NULL DEFAULT 'A', "DEPARTMENT_ID" SERIAL NOT NULL, "NAME" character varying(50) NOT NULL, "DESCRIPTION" character varying(100), CONSTRAINT "PK_b3142394ad5073f4a21ef3df9c4" PRIMARY KEY ("DEPARTMENT_ID"))`);
        await queryRunner.query(`CREATE TABLE "BUSINESS" ("BUSINESS_ID" integer NOT NULL, "NAME" character varying NOT NULL, "LOGO" bytea NOT NULL, "RNC" character varying NOT NULL, "PHONE" character varying NOT NULL, "ADDRESS" text NOT NULL, "STATE" character NOT NULL, CONSTRAINT "PK_8726e67e668478ef7d1aedd6a0e" PRIMARY KEY ("BUSINESS_ID"))`);
        await queryRunner.query(`ALTER TABLE "REFERENCE" ADD CONSTRAINT "FK_3fae0bec510324822c68b9fb0ea" FOREIGN KEY ("PERSON_ID") REFERENCES "PERSON"("PERSON_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "CONTACT" ADD CONSTRAINT "FK_4c2187d589e711ace441c01a922" FOREIGN KEY ("PERSON_ID") REFERENCES "PERSON"("PERSON_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ROLES_X_USER" ADD CONSTRAINT "FK_edeec0a0e0777511420bf2a6f84" FOREIGN KEY ("USER_ID", "USER_ID") REFERENCES "USER"("USER_ID","PERSON_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ROLES_X_USER" ADD CONSTRAINT "FK_cfb5ba942f33086e54cec026244" FOREIGN KEY ("ROLE_ID") REFERENCES "ROLE"("ROLE_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "MENU_OPTION" ADD CONSTRAINT "FK_1f20d78a9ea67f0564538ea95f7" FOREIGN KEY ("PARENT_ID") REFERENCES "MENU_OPTION"("MENU_OPTION_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PERMISSION_X_ROLE" ADD CONSTRAINT "FK_24cb3d11068904d9544b5add23b" FOREIGN KEY ("PERMISSION_ID") REFERENCES "PERMISSION"("PERMISSION_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PERMISSION_X_ROLE" ADD CONSTRAINT "FK_ae267066b6f7555d2adb197c85a" FOREIGN KEY ("ROLE_ID") REFERENCES "ROLE"("ROLE_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PERMISSION" ADD CONSTRAINT "FK_3c9b3cee370052f5bba1d4805af" FOREIGN KEY ("MENU_OPTION_ID") REFERENCES "MENU_OPTION"("MENU_OPTION_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PERMISSION" ADD CONSTRAINT "FK_3e0bac09494fb052114349b2a62" FOREIGN KEY ("ACTION_ID") REFERENCES "ACTION"("ACTION_ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "PERMISSION" DROP CONSTRAINT "FK_3e0bac09494fb052114349b2a62"`);
        await queryRunner.query(`ALTER TABLE "PERMISSION" DROP CONSTRAINT "FK_3c9b3cee370052f5bba1d4805af"`);
        await queryRunner.query(`ALTER TABLE "PERMISSION_X_ROLE" DROP CONSTRAINT "FK_ae267066b6f7555d2adb197c85a"`);
        await queryRunner.query(`ALTER TABLE "PERMISSION_X_ROLE" DROP CONSTRAINT "FK_24cb3d11068904d9544b5add23b"`);
        await queryRunner.query(`ALTER TABLE "MENU_OPTION" DROP CONSTRAINT "FK_1f20d78a9ea67f0564538ea95f7"`);
        await queryRunner.query(`ALTER TABLE "ROLES_X_USER" DROP CONSTRAINT "FK_cfb5ba942f33086e54cec026244"`);
        await queryRunner.query(`ALTER TABLE "ROLES_X_USER" DROP CONSTRAINT "FK_edeec0a0e0777511420bf2a6f84"`);
        await queryRunner.query(`ALTER TABLE "CONTACT" DROP CONSTRAINT "FK_4c2187d589e711ace441c01a922"`);
        await queryRunner.query(`ALTER TABLE "REFERENCE" DROP CONSTRAINT "FK_3fae0bec510324822c68b9fb0ea"`);
        await queryRunner.query(`DROP TABLE "BUSINESS"`);
        await queryRunner.query(`DROP TABLE "DEPARTMENT"`);
        await queryRunner.query(`DROP TABLE "PERMISSION"`);
        await queryRunner.query(`DROP TABLE "PERMISSION_X_ROLE"`);
        await queryRunner.query(`DROP TABLE "ACTION"`);
        await queryRunner.query(`DROP TABLE "MENU_OPTION"`);
        await queryRunner.query(`DROP TYPE "public"."MENU_OPTION_type_enum"`);
        await queryRunner.query(`DROP TABLE "ROLE"`);
        await queryRunner.query(`DROP TABLE "ROLES_X_USER"`);
        await queryRunner.query(`DROP TABLE "USER"`);
        await queryRunner.query(`DROP TABLE "PERSON"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_741e323799d657b06d86ca98cb"`);
        await queryRunner.query(`DROP TABLE "CONTACT"`);
        await queryRunner.query(`DROP TYPE "public"."CONTACT_usage_enum"`);
        await queryRunner.query(`DROP TYPE "public"."CONTACT_type_enum"`);
        await queryRunner.query(`DROP TABLE "REFERENCE"`);
    }

}
