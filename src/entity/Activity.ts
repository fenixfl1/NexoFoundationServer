import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { ActivityParticipant } from './ActivityParticipant'

export enum ActivityStatus {
  PLANNED = 'planned',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('ACTIVITY')
export class Activity extends BaseEntity {
  @PrimaryGeneratedColumn()
  ACTIVITY_ID: number

  @Column({ type: 'varchar', length: 150 })
  TITLE: string

  @Column({ type: 'text', nullable: true })
  DESCRIPTION: string | null

  @Column({ type: 'timestamp' })
  START_AT: Date

  @Column({ type: 'timestamp', nullable: true })
  END_AT: Date | null

  @Column({ type: 'varchar', length: 150, nullable: true })
  LOCATION: string | null

  @Column({ type: 'numeric', precision: 4, scale: 1, default: 0 })
  HOURS: number

  @Column({ type: 'integer', nullable: true })
  CAPACITY: number | null

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    enumName: 'ACTIVITY_status_enum',
    default: ActivityStatus.PLANNED,
  })
  STATUS: ActivityStatus

  @OneToMany(
    () => ActivityParticipant,
    (participant) => participant.ACTIVITY,
    { cascade: true }
  )
  PARTICIPANTS: ActivityParticipant[]
}
