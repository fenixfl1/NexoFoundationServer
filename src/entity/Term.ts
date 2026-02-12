import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Student } from './Student'
import { CourseGrade } from './CourseGrade'

@Entity('TERM')
export class Term extends BaseEntity {
  @PrimaryGeneratedColumn()
  TERM_ID: number

  @Column({ type: 'integer' })
  STUDENT_ID: number

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'STUDENT_ID' })
  STUDENT: Student

  // Ej.: 2025-1, 2025-Q2, 2026-01
  @Column({ type: 'varchar', length: 20 })
  PERIOD: string

  // Índice calculado (sumatoria ponderada de GRADE* CREDITS / total credits)
  @Column({ type: 'numeric', precision: 4, scale: 2, default: 0 })
  TERM_INDEX: number

  @Column({ type: 'integer', default: 0 })
  TOTAL_CREDITS: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  CAPTURE_FILE_NAME: string | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  CAPTURE_MIME_TYPE: string | null

  @Column({ type: 'text', nullable: true })
  CAPTURE_BASE64: string | null

  @Column({ type: 'text', nullable: true })
  OBSERVATIONS: string | null

  @OneToMany(() => CourseGrade, (course) => course.TERM, {
    cascade: true,
  })
  COURSES: CourseGrade[]
}
