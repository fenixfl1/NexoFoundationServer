import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Person } from './Person'

export enum ScholarshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  GRADUATED = 'graduated',
}

@Entity('STUDENT')
export class Student extends BaseEntity {
  @PrimaryGeneratedColumn()
  STUDENT_ID: number

  @Column({ type: 'integer' })
  PERSON_ID: number

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'PERSON_ID' })
  PERSON: Person

  @Column({ type: 'varchar', length: 150 })
  UNIVERSITY: string

  @Column({ type: 'varchar', length: 150 })
  CAREER: string

  @Column({
    type: 'enum',
    enum: ScholarshipStatus,
    default: ScholarshipStatus.PENDING,
  })
  SCHOLARSHIP_STATUS: ScholarshipStatus

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  ACADEMIC_AVERAGE: number

  @Column({ type: 'integer', default: 0 })
  HOURS_REQUIRED: number

  @Column({ type: 'integer', default: 0 })
  HOURS_COMPLETED: number

  @Column({ type: 'timestamp', nullable: true })
  LAST_FOLLOW_UP: Date | null

  @Column({ type: 'timestamp', nullable: true })
  NEXT_APPOINTMENT: Date | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  COHORT: string | null

  @Column({ type: 'varchar', length: 150, nullable: true })
  CAMPUS: string | null

  @Column({ type: 'integer', nullable: true })
  SCORE: number | null
}
