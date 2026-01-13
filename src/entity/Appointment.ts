import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Person } from './Person'
import { Request } from './Request'
import { Student } from './Student'

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('APPOINTMENT')
export class Appointment extends BaseEntity {
  @PrimaryGeneratedColumn()
  APPOINTMENT_ID: number

  @Column({ type: 'integer' })
  PERSON_ID: number

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'PERSON_ID' })
  PERSON: Person

  @Column({ type: 'integer', nullable: true })
  REQUEST_ID: number | null

  @ManyToOne(() => Request, { nullable: true })
  @JoinColumn({ name: 'REQUEST_ID' })
  REQUEST: Request | null

  @Column({ type: 'integer', nullable: true })
  STUDENT_ID: number | null

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'STUDENT_ID' })
  STUDENT: Student | null

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

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    enumName: 'APPOINTMENT_status_enum',
    default: AppointmentStatus.SCHEDULED,
  })
  STATUS: AppointmentStatus

  @Column({ type: 'varchar', length: 255, nullable: true })
  NOTES: string | null
}
