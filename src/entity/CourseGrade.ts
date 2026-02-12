import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Term } from './Term'

export enum CourseResultStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  IN_PROGRESS = 'in_progress',
}

@Entity('COURSE_GRADE')
export class CourseGrade extends BaseEntity {
  @PrimaryGeneratedColumn()
  COURSE_GRADE_ID: number

  @Column({ type: 'integer' })
  TERM_ID: number

  @ManyToOne(() => Term, (term) => term.COURSES, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'TERM_ID' })
  TERM: Term

  @Column({ type: 'varchar', length: 150 })
  COURSE_NAME: string

  @Column({ type: 'numeric', precision: 4, scale: 2 })
  GRADE: number

  @Column({ type: 'numeric', precision: 4, scale: 1, default: 0 })
  CREDITS: number

  @Column({
    type: 'enum',
    enum: CourseResultStatus,
    enumName: 'COURSE_GRADE_status_enum',
    default: CourseResultStatus.IN_PROGRESS,
  })
  STATUS: CourseResultStatus
}
