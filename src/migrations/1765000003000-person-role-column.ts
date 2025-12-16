import { MigrationInterface, QueryRunner } from 'typeorm'

export class PersonRoleColumn1765000003000 implements MigrationInterface {
  name = 'PersonRoleColumn1765000003000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "PERSON"
      ADD COLUMN "ROLE_ID" integer
    `)

    await queryRunner.query(`
      WITH roles_per_person AS (
        SELECT u."PERSON_ID", MIN(rx."ROLE_ID") AS "ROLE_ID"
        FROM "USER" u
        JOIN "ROLES_X_USER" rx ON rx."USER_ID" = u."USER_ID"
        WHERE rx."STATE" = 'A'
        GROUP BY u."PERSON_ID"
      )
      UPDATE "PERSON" p
      SET "ROLE_ID" = r."ROLE_ID"
      FROM roles_per_person r
      WHERE r."PERSON_ID" = p."PERSON_ID"
    `)

    // await queryRunner.query(`
    //   ALTER TABLE "PERSON"
    //   ALTER COLUMN "ROLE_ID" SET NOT NULL
    // `)

    await queryRunner.query(`
      ALTER TABLE "PERSON"
      ADD CONSTRAINT "FK_PERSON_ROLE" FOREIGN KEY ("ROLE_ID") REFERENCES "ROLE"("ROLE_ID")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PERSON" DROP CONSTRAINT "FK_PERSON_ROLE"`
    )
    await queryRunner.query(`ALTER TABLE "PERSON" DROP COLUMN "ROLE_ID"`)
  }
}
