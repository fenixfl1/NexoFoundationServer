import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Person } from './Person'
import { Student } from './Student'

export enum RequestStatus {
  NEW = 'new',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SCHEDULED = 'scheduled',
}

@Entity('REQUEST')
export class Request extends BaseEntity {
  @PrimaryGeneratedColumn()
  REQUEST_ID: number

  @Column({ type: 'integer' })
  PERSON_ID: number

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'PERSON_ID' })
  PERSON: Person

  @Column({ type: 'integer', nullable: true })
  STUDENT_ID: number | null

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'STUDENT_ID' })
  STUDENT: Student | null

  @Column({ type: 'varchar', length: 100 })
  REQUEST_TYPE: string

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.NEW,
  })
  STATUS: RequestStatus

  @Column({ type: 'varchar', length: 150, nullable: true })
  ASSIGNED_COORDINATOR: string | null

  @Column({ type: 'timestamp', nullable: true })
  NEXT_APPOINTMENT: Date | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  COHORT: string | null

  @Column({ type: 'text', nullable: true })
  NOTES: string | null
}
