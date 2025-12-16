import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { CatalogItem } from './CatalogItem'

@Entity('CATALOG')
export class Catalog extends BaseEntity {
  @PrimaryGeneratedColumn()
  CATALOG_ID: number

  @Column({ type: 'varchar', length: 100, unique: true })
  KEY: string

  @Column({ type: 'varchar', length: 150 })
  NAME: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  DESCRIPTION: string | null

  @OneToMany(() => CatalogItem, (item) => item.CATALOG)
  ITEMS: CatalogItem[]
}
