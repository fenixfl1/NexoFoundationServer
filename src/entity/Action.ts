import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity({ name: 'ACTION' })
export class Action extends BaseEntity {
  @PrimaryGeneratedColumn()
  ACTION_ID: number

  @Column({ type: 'varchar', length: 255 })
  NAME: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  DESCRIPTION: string | null
}
