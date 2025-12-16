import { MigrationInterface, QueryRunner } from 'typeorm'

type Cohort = { value: string; label: string; order: number }

export class CatalogInstitutionCohorts1765000003300
  implements MigrationInterface
{
  name = 'CatalogInstitutionCohorts1765000003300'

  private catalogKey = 'institution_cohorts'
  private catalogName = 'Convocatorias institucionales'

  private cohorts: Cohort[] = [
    { value: '2024-1', label: 'Convocatoria 2024-1', order: 1 },
    { value: '2024-2', label: 'Convocatoria 2024-2', order: 2 },
    { value: '2025-1', label: 'Convocatoria 2025-1', order: 3 },
    { value: '2025-2', label: 'Convocatoria 2025-2', order: 4 },
    { value: '2026-1', label: 'Convocatoria 2026-1', order: 5 },
  ]

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        INSERT INTO "CATALOG" ("KEY", "NAME", "DESCRIPTION", "STATE")
        VALUES ($1, $2, $3, 'A')
        ON CONFLICT ("KEY") DO NOTHING
      `,
      [this.catalogKey, this.catalogName, 'Convocatorias internas de becas']
    )

    for (const cohort of this.cohorts) {
      await queryRunner.query(
        `
          INSERT INTO "CATALOG_ITEM" (
            "CATALOG_ID",
            "VALUE",
            "LABEL",
            "ORDER",
            "STATE"
          )
          VALUES (
            (SELECT "CATALOG_ID" FROM "CATALOG" WHERE "KEY" = $1),
            $2,
            $3,
            $4,
            'A'
          )
          ON CONFLICT ("CATALOG_ID", "VALUE") DO NOTHING
        `,
        [this.catalogKey, cohort.value, cohort.label, cohort.order]
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "CATALOG_ITEM" WHERE "CATALOG_ID" = (SELECT "CATALOG_ID" FROM "CATALOG" WHERE "KEY" = $1)`,
      [this.catalogKey]
    )

    await queryRunner.query(
      `DELETE FROM "CATALOG" WHERE "KEY" = $1`,
      [this.catalogKey]
    )
  }
}
