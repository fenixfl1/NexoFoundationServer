import { MigrationInterface, QueryRunner } from 'typeorm'

type Uni = { value: string; label: string; order: number }

export class CatalogUniversitiesDo1765000001000
  implements MigrationInterface
{
  name = 'CatalogUniversitiesDo1765000001000'

  private catalogKey = 'universities_do'
  private catalogName = 'Universidades RD'

  private universities: Uni[] = [
    { value: 'UASD', label: 'Universidad Autónoma de Santo Domingo', order: 1 },
    { value: 'PUCMM', label: 'Pontificia Universidad Católica Madre y Maestra', order: 2 },
    { value: 'UNPHU', label: 'Universidad Nacional Pedro Henríquez Ureña', order: 3 },
    { value: 'UNAPEC', label: 'Universidad APEC', order: 4 },
    { value: 'UNIBE', label: 'Universidad Iberoamericana', order: 5 },
    { value: 'INTEC', label: 'Instituto Tecnológico de Santo Domingo', order: 6 },
    { value: 'UCNE', label: 'Universidad Católica Nordestana', order: 7 },
    { value: 'UCSD', label: 'Universidad Católica Santo Domingo', order: 8 },
    { value: 'UCE', label: 'Universidad Central del Este', order: 9 },
    { value: 'UAPA', label: 'Universidad Abierta para Adultos', order: 10 },
    { value: 'UTESA', label: 'Universidad Tecnológica de Santiago', order: 11 },
    { value: 'UNICARIBE', label: 'Universidad del Caribe', order: 12 },
    { value: 'UNEV', label: 'Universidad Nacional Evangélica', order: 13 },
    { value: 'OYM', label: 'Universidad Dominicana O&M', order: 14 },
    { value: 'UTECO', label: 'Universidad Tecnológica del Cibao Oriental', order: 15 },
    { value: 'UTESUR', label: 'Universidad Tecnológica del Sur', order: 16 },
    { value: 'UTEB', label: 'Universidad Tecnológica de Barahona', order: 17 },
    { value: 'UAFAM', label: 'Universidad Agroforestal Fernando Arturo de Meriño', order: 18 },
    { value: 'UNEFA', label: 'Universidad Experimental Félix Adam', order: 19 },
    { value: 'ITLA', label: 'Instituto Tecnológico de las Américas', order: 20 },
    { value: 'LOYOLA', label: 'Instituto Especializado de Estudios Superiores Loyola', order: 21 },
    { value: 'UNAD', label: 'Universidad Adventista Dominicana', order: 22 },
    { value: 'UCATECI', label: 'Universidad Católica Tecnológica del Cibao', order: 23 },
    { value: 'UCATEBA', label: 'Universidad Católica Tecnológica de Barahona', order: 24 },
    { value: 'UPPP', label: 'Universidad Politécnica de Puerto Plata', order: 25 },
  ]

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        INSERT INTO "CATALOG" ("KEY", "NAME", "DESCRIPTION", "STATE")
        VALUES ($1, $2, $3, 'A')
        ON CONFLICT ("KEY") DO NOTHING
      `,
      [this.catalogKey, this.catalogName, 'Universidades de República Dominicana']
    )

    for (const uni of this.universities) {
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
        [this.catalogKey, uni.value, uni.label, uni.order]
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
