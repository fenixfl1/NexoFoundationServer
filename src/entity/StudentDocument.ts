import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Student } from './Student'

@Entity('STUDENT_DOCUMENT')
export class StudentDocument extends BaseEntity {
  @PrimaryGeneratedColumn()
  DOCUMENT_ID: number

  @Column({ type: 'integer' })
  STUDENT_ID: number

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'STUDENT_ID' })
  STUDENT: Student

  @Column({ type: 'varchar', length: 100 })
  DOCUMENT_TYPE: string

  @Column({ type: 'varchar', length: 255 })
  FILE_NAME: string

  @Column({ type: 'varchar', length: 100 })
  MIME_TYPE: string

  @Column({ type: 'text' })
  FILE_BASE64: string

  @Column({ type: 'text', nullable: true })
  SIGNED_BASE64: string | null

  @Column({ type: 'timestamp', nullable: true })
  SIGNED_AT: Date | null

  @Column({ type: 'text', nullable: true })
  DESCRIPTION: string | null
}
