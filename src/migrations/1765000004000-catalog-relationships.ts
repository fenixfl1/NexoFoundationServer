import { MigrationInterface, QueryRunner } from 'typeorm'

type Relationship = { label: string; value: string; order: number }

export class CatalogRelationships1765000004000 implements MigrationInterface {
  name = 'CatalogRelationships1765000004000'

  private catalogKey = 'relationships'
  private catalogName = 'Parentescos'

  private relationships: Relationship[] = [
    { label: 'Padre', value: 'padre', order: 1 },
    { label: 'Madre', value: 'madre', order: 2 },
    { label: 'Hijo(a)', value: 'hijo(a)', order: 3 },
    { label: 'Hermano(a)', value: 'hermano(a)', order: 4 },
    { label: 'Tío(a)', value: 'tio(a)', order: 5 },
    { label: 'Sobrino(a)', value: 'sobrino(a)', order: 6 },
    { label: 'Abuelo(a)', value: 'abuelo(a)', order: 7 },
    { label: 'Primo(a)', value: 'primo(a)', order: 8 },
    { label: 'Amigo(a)', value: 'amigo(a)', order: 9 },
    { label: 'Novio(a)', value: 'novio(a)', order: 10 },
    { label: 'Esposo(a)', value: 'esposo(a)', order: 11 },
    {
      label: 'Compañero(a) de trabajo',
      value: 'compañero(a)_trabajo',
      order: 12,
    },
    { label: 'Vecino(a)', value: 'vecino(a)', order: 13 },
    { label: 'Conocido(a)', value: 'conocido(a)', order: 14 },
  ]

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        INSERT INTO "CATALOG" ("KEY", "NAME", "DESCRIPTION", "STATE")
        VALUES ($1, $2, $3, 'A')
        ON CONFLICT ("KEY") DO NOTHING
      `,
      [this.catalogKey, this.catalogName, 'Relaciones de parentesco']
    )

    for (const relationship of this.relationships) {
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
        [
          this.catalogKey,
          relationship.value,
          relationship.label,
          relationship.order,
        ]
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "CATALOG_ITEM" WHERE "CATALOG_ID" = (SELECT "CATALOG_ID" FROM "CATALOG" WHERE "KEY" = $1)`,
      [this.catalogKey]
    )

    await queryRunner.query(`DELETE FROM "CATALOG" WHERE "KEY" = $1`, [
      this.catalogKey,
    ])
  }
}
