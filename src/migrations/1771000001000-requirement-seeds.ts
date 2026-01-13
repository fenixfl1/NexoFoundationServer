import { MigrationInterface, QueryRunner } from 'typeorm'

export class RequirementSeeds1771000001000 implements MigrationInterface {
  name = 'RequirementSeeds1771000001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "REQUIREMENT" (
        "CREATED_AT",
        "CREATED_BY",
        "STATE",
        "REQUIREMENT_KEY",
        "NAME",
        "DESCRIPTION",
        "IS_REQUIRED"
      )
      VALUES
        (NOW(), NULL, 'A', 'CARTA_ACEPTACION', 'Carta de aceptación', 'Carta de aceptación de la institución educativa.', TRUE),
        (NOW(), NULL, 'A', 'CEDULA', 'Cédula', 'Documento de identidad.', TRUE),
        (NOW(), NULL, 'A', 'ACTA_NACIMIENTO', 'Acta de nacimiento', 'Acta de nacimiento actualizada.', TRUE),
        (NOW(), NULL, 'A', 'RECORD_NOTAS', 'Récord de notas', 'Historial académico oficial.', TRUE),
        (NOW(), NULL, 'A', 'CARTA_COMPROMISO', 'Carta compromiso', 'Compromiso firmado con la fundación.', TRUE),
        (NOW(), NULL, 'A', 'FOTO', 'Foto', 'Foto tipo carnet.', FALSE)
      ON CONFLICT ("REQUIREMENT_KEY") DO UPDATE
      SET
        "NAME" = EXCLUDED."NAME",
        "DESCRIPTION" = EXCLUDED."DESCRIPTION",
        "IS_REQUIRED" = EXCLUDED."IS_REQUIRED",
        "STATE" = 'A'
    `)

    await queryRunner.query(`
      INSERT INTO "STUDENT_REQUIREMENT" (
        "CREATED_AT",
        "CREATED_BY",
        "STATE",
        "STUDENT_ID",
        "REQUIREMENT_ID",
        "STATUS"
      )
      SELECT
        NOW(),
        NULL,
        'A',
        s."STUDENT_ID",
        r."REQUIREMENT_ID",
        'P'
      FROM "STUDENT" s
      CROSS JOIN "REQUIREMENT" r
      WHERE r."STATE" = 'A'
      ON CONFLICT ("STUDENT_ID", "REQUIREMENT_ID") DO NOTHING
    `)

    await queryRunner.query(`
      UPDATE "STUDENT_REQUIREMENT" sr
      SET "STATUS" = 'R'
      FROM "STUDENT_DOCUMENT" d
      WHERE sr."STUDENT_ID" = d."STUDENT_ID"
        AND sr."REQUIREMENT_ID" IN (
          SELECT r."REQUIREMENT_ID"
          FROM "REQUIREMENT" r
          WHERE r."REQUIREMENT_KEY" = d."DOCUMENT_TYPE"
        )
        AND sr."STATUS" = 'P'
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "STUDENT_REQUIREMENT"
      WHERE "REQUIREMENT_ID" IN (
        SELECT "REQUIREMENT_ID"
        FROM "REQUIREMENT"
        WHERE "REQUIREMENT_KEY" IN (
          'CARTA_ACEPTACION',
          'CEDULA',
          'ACTA_NACIMIENTO',
          'RECORD_NOTAS',
          'CARTA_COMPROMISO',
          'FOTO'
        )
      )
    `)

    await queryRunner.query(`
      DELETE FROM "REQUIREMENT"
      WHERE "REQUIREMENT_KEY" IN (
        'CARTA_ACEPTACION',
        'CEDULA',
        'ACTA_NACIMIENTO',
        'RECORD_NOTAS',
        'CARTA_COMPROMISO',
        'FOTO'
      )
    `)
  }
}
