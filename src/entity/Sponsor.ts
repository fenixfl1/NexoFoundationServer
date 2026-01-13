import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('SPONSOR')
export class Sponsor extends BaseEntity {
  @PrimaryGeneratedColumn()
  SPONSOR_ID: number

  @Column({ type: 'varchar', length: 150 })
  NAME: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  TYPE?: string | null

  @Column({ type: 'varchar', length: 30, nullable: true })
  TAX_ID?: string | null

  @Column({ type: 'varchar', length: 150, nullable: true })
  CONTACT_NAME?: string | null

  @Column({ type: 'varchar', length: 150, nullable: true })
  CONTACT_EMAIL?: string | null

  @Column({ type: 'varchar', length: 30, nullable: true })
  CONTACT_PHONE?: string | null

  @Column({ type: 'text', nullable: true })
  ADDRESS?: string | null

  @Column({ type: 'text', nullable: true })
  NOTES?: string | null
}
