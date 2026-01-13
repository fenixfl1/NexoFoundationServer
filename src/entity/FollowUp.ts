import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Student } from './Student'
import { Appointment } from './Appointment'

export enum FollowUpStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('FOLLOW_UP')
export class FollowUp extends BaseEntity {
  @PrimaryGeneratedColumn()
  FOLLOW_UP_ID: number

  @Column({ type: 'integer' })
  STUDENT_ID: number

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'STUDENT_ID' })
  STUDENT: Student

  @Column({ type: 'integer', nullable: true })
  APPOINTMENT_ID: number | null

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'APPOINTMENT_ID' })
  APPOINTMENT: Appointment | null

  @Column({ type: 'timestamp' })
  FOLLOW_UP_DATE: Date

  @Column({ type: 'text' })
  SUMMARY: string

  @Column({ type: 'text', nullable: true })
  NOTES: string | null

  @Column({ type: 'timestamp', nullable: true })
  NEXT_APPOINTMENT: Date | null

  @Column({
    type: 'enum',
    enum: FollowUpStatus,
    enumName: 'FOLLOW_UP_status_enum',
    default: FollowUpStatus.OPEN,
  })
  STATUS: FollowUpStatus
}
