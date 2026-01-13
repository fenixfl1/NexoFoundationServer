import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Sponsor } from './Sponsor'

@Entity('PLEDGE')
export class Pledge extends BaseEntity {
  @PrimaryGeneratedColumn()
  PLEDGE_ID: number

  @Column({ type: 'integer' })
  SPONSOR_ID: number

  @ManyToOne(() => Sponsor)
  @JoinColumn({ name: 'SPONSOR_ID' })
  SPONSOR: Sponsor

  @Column({ type: 'varchar', length: 150 })
  NAME: string

  @Column({ type: 'text', nullable: true })
  DESCRIPTION?: string | null

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  AMOUNT: number

  @Column({ type: 'date' })
  START_DATE: Date

  @Column({ type: 'date', nullable: true })
  END_DATE?: Date | null

  @Column({ type: 'varchar', length: 30, nullable: true })
  FREQUENCY?: string | null

  @Column({ type: 'char', length: 1, default: 'P' })
  STATUS: string

  @Column({ type: 'text', nullable: true })
  NOTES?: string | null
}
