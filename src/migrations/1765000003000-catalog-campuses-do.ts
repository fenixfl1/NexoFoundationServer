import { MigrationInterface, QueryRunner } from 'typeorm'

type Campus = { value: string; label: string; order: number; university: string }

export class CatalogCampusesDo1765000003000 implements MigrationInterface {
  name = 'CatalogCampusesDo1765000003000'

  private catalogKey = 'campuses_do'
  private catalogName = 'Campus RD'

  private campuses: Campus[] = [
    { value: 'UASD_SD', label: 'UASD - Santo Domingo', order: 1, university: 'UASD' },
    { value: 'UASD_STGO', label: 'UASD - Santiago', order: 2, university: 'UASD' },
    { value: 'UASD_SFM', label: 'UASD - San Francisco de Macorís', order: 3, university: 'UASD' },
    { value: 'UASD_BAR', label: 'UASD - Barahona', order: 4, university: 'UASD' },
    { value: 'PUCMM_STGO', label: 'PUCMM - Santiago', order: 5, university: 'PUCMM' },
    { value: 'PUCMM_SD', label: 'PUCMM - Santo Domingo', order: 6, university: 'PUCMM' },
    { value: 'INTEC_SD', label: 'INTEC - Santo Domingo', order: 7, university: 'INTEC' },
    { value: 'UNAPEC_SD', label: 'UNAPEC - Santo Domingo', order: 8, university: 'UNAPEC' },
    { value: 'UTESA_STGO', label: 'UTESA - Santiago', order: 9, university: 'UTESA' },
    { value: 'UTESA_SD', label: 'UTESA - Santo Domingo', order: 10, university: 'UTESA' },
    { value: 'UTESA_PP', label: 'UTESA - Puerto Plata', order: 11, university: 'UTESA' },
    { value: 'UTESA_MAO', label: 'UTESA - Mao', order: 12, university: 'UTESA' },
    { value: 'UTESA_MOC', label: 'UTESA - Moca', order: 13, university: 'UTESA' },
    { value: 'UNPHU_SD', label: 'UNPHU - Santo Domingo', order: 14, university: 'UNPHU' },
    { value: 'UNIBE_SD', label: 'UNIBE - Santo Domingo', order: 15, university: 'UNIBE' },
    { value: 'UCSD_SD', label: 'UCSD - Santo Domingo', order: 16, university: 'UCSD' },
    { value: 'UNICARIBE_SD', label: 'UNICARIBE - Santo Domingo', order: 17, university: 'UNICARIBE' },
    { value: 'UCE_SPM', label: 'UCE - San Pedro de Macorís', order: 18, university: 'UCE' },
    { value: 'UAPA_STGO', label: 'UAPA - Santiago', order: 19, university: 'UAPA' },
    { value: 'UTECO_COT', label: 'UTECO - Cotuí', order: 20, university: 'UTECO' },
    { value: 'UTEB_BAR', label: 'UTEB - Barahona', order: 21, university: 'UTEB' },
    { value: 'UCATECI_LV', label: 'UCATECI - La Vega', order: 22, university: 'UCATECI' },
    { value: 'UCATEBA_BAR', label: 'UCATEBA - Barahona', order: 23, university: 'UCATEBA' },
    { value: 'LOYOLA_SC', label: 'LOYOLA - San Cristóbal', order: 24, university: 'LOYOLA' },
    { value: 'ITLA_SD', label: 'ITLA - Santo Domingo', order: 25, university: 'ITLA' },
    { value: 'UNEV_SD', label: 'UNEV - Santo Domingo', order: 26, university: 'UNEV' },
    { value: 'UNAD_BON', label: 'UNAD - Bonao', order: 27, university: 'UNAD' },
    { value: 'OYM_SD', label: 'O&M - Santo Domingo', order: 28, university: 'OYM' },
    { value: 'UCNE_SFM', label: 'UCNE - San Francisco de Macorís', order: 29, university: 'UCNE' },
  ]

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        INSERT INTO "CATALOG" ("KEY", "NAME", "DESCRIPTION", "STATE")
        VALUES ($1, $2, $3, 'A')
        ON CONFLICT ("KEY") DO NOTHING
      `,
      [this.catalogKey, this.catalogName, 'Campus de República Dominicana']
    )

    for (const campus of this.campuses) {
      await queryRunner.query(
        `
          INSERT INTO "CATALOG_ITEM" (
            "CATALOG_ID",
            "VALUE",
            "LABEL",
            "ORDER",
            "EXTRA",
            "STATE"
          )
          VALUES (
            (SELECT "CATALOG_ID" FROM "CATALOG" WHERE "KEY" = $1),
            $2,
            $3,
            $4,
            $5::json,
            'A'
          )
          ON CONFLICT ("CATALOG_ID", "VALUE") DO NOTHING
        `,
        [
          this.catalogKey,
          campus.value,
          campus.label,
          campus.order,
          JSON.stringify({ university: campus.university }),
        ]
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
