import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Person } from './Person'

@Entity('SPONSOR')
export class Sponsor extends BaseEntity {
  @PrimaryGeneratedColumn()
  SPONSOR_ID: number

  @Column({ type: 'integer', nullable: true })
  PERSON_ID?: number | null

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'PERSON_ID' })
  PERSON?: Person | null

  @Column({ type: 'varchar', length: 150 })
  NAME: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  TYPE?: string | null

  @Column({ type: 'varchar', length: 30, nullable: true })
  TAX_ID?: string | null
}
