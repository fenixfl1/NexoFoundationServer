import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Activity } from './Activity'
import { Student } from './Student'

export enum ParticipantStatus {
  REGISTERED = 'registered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('ACTIVITY_PARTICIPANT')
export class ActivityParticipant extends BaseEntity {
  @PrimaryGeneratedColumn()
  PARTICIPANT_ID: number

  @Column({ type: 'integer' })
  ACTIVITY_ID: number

  @ManyToOne(() => Activity, (activity) => activity.PARTICIPANTS, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ACTIVITY_ID' })
  ACTIVITY: Activity

  @Column({ type: 'integer' })
  STUDENT_ID: number

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'STUDENT_ID' })
  STUDENT: Student

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    enumName: 'ACTIVITY_PARTICIPANT_status_enum',
    default: ParticipantStatus.REGISTERED,
  })
  STATUS: ParticipantStatus

  @Column({ type: 'numeric', precision: 4, scale: 1, default: 0 })
  HOURS_EARNED: number

  @Column({ type: 'timestamp', nullable: true })
  ATTENDED_AT: Date | null
}
