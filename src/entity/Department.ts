import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('DEPARTMENT')
export class Department extends BaseEntity {
  @PrimaryGeneratedColumn()
  DEPARTMENT_ID: number

  @Column({ type: 'varchar', length: 50 })
  NAME: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  DESCRIPTION: string
}
