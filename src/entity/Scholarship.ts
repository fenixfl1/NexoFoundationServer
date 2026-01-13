import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Student } from './Student'
import { Request } from './Request'

@Entity('SCHOLARSHIP')
export class Scholarship extends BaseEntity {
  @PrimaryGeneratedColumn()
  SCHOLARSHIP_ID: number

  @Column({ type: 'integer' })
  STUDENT_ID: number

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'STUDENT_ID' })
  STUDENT: Student

  @Column({ type: 'integer', nullable: true })
  REQUEST_ID?: number | null

  @ManyToOne(() => Request)
  @JoinColumn({ name: 'REQUEST_ID' })
  REQUEST?: Request

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

  @Column({ type: 'char', length: 1, default: 'P' })
  STATUS: string

  @Column({ type: 'char', length: 1, default: 'S' })
  PERIOD_TYPE: string
}
