import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Student } from './Student'
import { Requirement } from './Requirement'
import { User } from './User'

@Entity('STUDENT_REQUIREMENT')
export class StudentRequirement extends BaseEntity {
  @PrimaryGeneratedColumn()
  STUDENT_REQUIREMENT_ID: number

  @Column({ type: 'integer' })
  STUDENT_ID: number

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'STUDENT_ID' })
  STUDENT: Student

  @Column({ type: 'integer' })
  REQUIREMENT_ID: number

  @ManyToOne(() => Requirement)
  @JoinColumn({ name: 'REQUIREMENT_ID' })
  REQUIREMENT: Requirement

  @Column({ type: 'char', length: 1, default: 'P' })
  STATUS: string

  @Column({ type: 'text', nullable: true })
  OBSERVATION?: string | null

  @Column({ type: 'integer', nullable: true })
  VALIDATED_BY?: number | null

  @ManyToOne(() => User)
  @JoinColumn({ name: 'VALIDATED_BY' })
  VALIDATED_USER?: User

  @Column({ type: 'timestamp', nullable: true })
  VALIDATED_AT?: Date | null
}
