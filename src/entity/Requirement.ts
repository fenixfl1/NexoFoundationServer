import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('REQUIREMENT')
export class Requirement extends BaseEntity {
  @PrimaryGeneratedColumn()
  REQUIREMENT_ID: number

  @Column({ type: 'varchar', length: 100, unique: true })
  REQUIREMENT_KEY: string

  @Column({ type: 'varchar', length: 150 })
  NAME: string

  @Column({ type: 'text', nullable: true })
  DESCRIPTION?: string | null

  @Column({ type: 'boolean', default: true })
  IS_REQUIRED: boolean
}
