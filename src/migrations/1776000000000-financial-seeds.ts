import { MigrationInterface, QueryRunner } from 'typeorm'

export class FinancialSeeds1776000000000 implements MigrationInterface {
  name = 'FinancialSeeds1776000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "SPONSOR" (
        "CREATED_AT",
        "CREATED_BY",
        "STATE",
        "NAME",
        "TYPE",
        "TAX_ID",
        "CONTACT_NAME",
        "CONTACT_EMAIL",
        "CONTACT_PHONE",
        "ADDRESS",
        "NOTES"
      )
      VALUES
        (NOW(), NULL, 'A', 'Fundación Horizonte', 'foundation', 'RNC-001122', 'María Paredes', 'maria.paredes@example.com', '809-555-1001', 'Av. Central 123, SD', 'Patrocinador principal'),
        (NOW(), NULL, 'A', 'Grupo Caribe', 'company', 'RNC-009988', 'Luis Gómez', 'luis.gomez@example.com', '809-555-1002', 'Calle Norte 45, SD', 'Apoyo anual'),
        (NOW(), NULL, 'A', 'Ana Morales', 'person', '001-1234567-8', 'Ana Morales', 'ana.morales@example.com', '809-555-1003', 'Santiago', 'Donante individual')
      ON CONFLICT DO NOTHING
    `)

    await queryRunner.query(`
      INSERT INTO "SCHOLARSHIP" (
        "CREATED_AT",
        "CREATED_BY",
        "STATE",
        "STUDENT_ID",
        "REQUEST_ID",
        "NAME",
        "DESCRIPTION",
        "AMOUNT",
        "START_DATE",
        "END_DATE",
        "STATUS",
        "PERIOD_TYPE"
      )
      SELECT
        NOW(),
        NULL,
        'A',
        s."STUDENT_ID",
        NULL,
        'Beca Académica 2025',
        'Beca por desempeño académico.',
        45000.00,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '180 day',
        'A',
        'S'
      FROM "STUDENT" s
      WHERE s."STUDENT_ID" IS NOT NULL
      ORDER BY s."STUDENT_ID"
      LIMIT 1
      ON CONFLICT DO NOTHING
    `)

    await queryRunner.query(`
      INSERT INTO "SCHOLARSHIP_COST_HISTORY" (
        "CREATED_AT",
        "CREATED_BY",
        "STATE",
        "SCHOLARSHIP_ID",
        "PERIOD_TYPE",
        "PERIOD_LABEL",
        "PERIOD_START",
        "PERIOD_END",
        "AMOUNT",
        "STATUS",
        "NOTES"
      )
      SELECT
        NOW(),
        NULL,
        'A',
        sc."SCHOLARSHIP_ID",
        'S',
        '2025-1',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '180 day',
        45000.00,
        'P',
        'Costo del semestre 2025-1'
      FROM "SCHOLARSHIP" sc
      ORDER BY sc."SCHOLARSHIP_ID"
      LIMIT 1
      ON CONFLICT ("SCHOLARSHIP_ID", "PERIOD_LABEL") DO NOTHING
    `)

    await queryRunner.query(`
      INSERT INTO "DISBURSEMENT" (
        "CREATED_AT",
        "CREATED_BY",
        "STATE",
        "SCHOLARSHIP_ID",
        "COST_ID",
        "AMOUNT",
        "DISBURSEMENT_DATE",
        "METHOD",
        "REFERENCE",
        "STATUS",
        "NOTES"
      )
      SELECT
        NOW(),
        NULL,
        'A',
        ch."SCHOLARSHIP_ID",
        ch."COST_ID",
        ch."AMOUNT",
        ch."PERIOD_END",
        'transfer',
        'TRX-2025-0001',
        'P',
        'Desembolso de prueba'
      FROM "SCHOLARSHIP_COST_HISTORY" ch
      ORDER BY ch."COST_ID"
      LIMIT 1
      ON CONFLICT DO NOTHING
    `)

    await queryRunner.query(`
      INSERT INTO "PLEDGE" (
        "CREATED_AT",
        "CREATED_BY",
        "STATE",
        "SPONSOR_ID",
        "NAME",
        "DESCRIPTION",
        "AMOUNT",
        "START_DATE",
        "END_DATE",
        "FREQUENCY",
        "STATUS",
        "NOTES"
      )
      SELECT
        NOW(),
        NULL,
        'A',
        s."SPONSOR_ID",
        'Compromiso 2025',
        'Aporte semestral para becas.',
        90000.00,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '365 day',
        'semiannual',
        'A',
        'Compromiso vigente'
      FROM "SPONSOR" s
      ORDER BY s."SPONSOR_ID"
      LIMIT 1
      ON CONFLICT DO NOTHING
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "DISBURSEMENT"
      WHERE "REFERENCE" = 'TRX-2025-0001'
    `)

    await queryRunner.query(`
      DELETE FROM "SCHOLARSHIP_COST_HISTORY"
      WHERE "PERIOD_LABEL" = '2025-1'
    `)

    await queryRunner.query(`
      DELETE FROM "SCHOLARSHIP"
      WHERE "NAME" = 'Beca Académica 2025'
    `)

    await queryRunner.query(`
      DELETE FROM "PLEDGE"
      WHERE "NAME" = 'Compromiso 2025'
    `)

    await queryRunner.query(`
      DELETE FROM "SPONSOR"
      WHERE "NAME" IN ('Fundación Horizonte', 'Grupo Caribe', 'Ana Morales')
    `)
  }
}
