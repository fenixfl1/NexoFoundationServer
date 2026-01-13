import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Scholarship } from './Scholarship'

@Entity('SCHOLARSHIP_COST_HISTORY')
export class ScholarshipCostHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  COST_ID: number

  @Column({ type: 'integer' })
  SCHOLARSHIP_ID: number

  @ManyToOne(() => Scholarship)
  @JoinColumn({ name: 'SCHOLARSHIP_ID' })
  SCHOLARSHIP: Scholarship

  @Column({ type: 'char', length: 1 })
  PERIOD_TYPE: string

  @Column({ type: 'varchar', length: 30 })
  PERIOD_LABEL: string

  @Column({ type: 'date' })
  PERIOD_START: Date

  @Column({ type: 'date' })
  PERIOD_END: Date

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  AMOUNT: number

  @Column({ type: 'char', length: 1, default: 'P' })
  STATUS: string

  @Column({ type: 'text', nullable: true })
  NOTES?: string | null
}
