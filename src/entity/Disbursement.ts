import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Scholarship } from './Scholarship'

@Entity('DISBURSEMENT')
export class Disbursement extends BaseEntity {
  @PrimaryGeneratedColumn()
  DISBURSEMENT_ID: number

  @Column({ type: 'integer' })
  SCHOLARSHIP_ID: number

  @ManyToOne(() => Scholarship)
  @JoinColumn({ name: 'SCHOLARSHIP_ID' })
  SCHOLARSHIP: Scholarship

  @Column({ type: 'integer', nullable: true })
  COST_ID?: number | null

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  AMOUNT: number

  @Column({ type: 'date' })
  DISBURSEMENT_DATE: Date

  @Column({ type: 'varchar', length: 50, nullable: true })
  METHOD?: string | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  REFERENCE?: string | null

  @Column({ type: 'char', length: 1, default: 'P' })
  STATUS: string

  @Column({ type: 'text', nullable: true })
  NOTES?: string | null
}
