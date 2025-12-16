import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Catalog } from './Catalog'

@Entity('CATALOG_ITEM')
export class CatalogItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  ITEM_ID: number

  @Column({ type: 'integer' })
  CATALOG_ID: number

  @ManyToOne(() => Catalog, (catalog) => catalog.ITEMS)
  @JoinColumn({ name: 'CATALOG_ID' })
  CATALOG: Catalog

  @Column({ type: 'varchar', length: 100 })
  VALUE: string

  @Column({ type: 'varchar', length: 200 })
  LABEL: string

  @Column({ type: 'integer', default: 0 })
  ORDER: number

  @Column({ type: 'json', nullable: true })
  EXTRA: Record<string, any> | null
}
