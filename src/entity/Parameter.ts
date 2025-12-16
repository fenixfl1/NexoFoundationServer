import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { MenuOption } from './MenuOption'

@Entity('PARAMETER')
export class Parameter extends BaseEntity {
  @PrimaryGeneratedColumn()
  PARAMETER_ID: number

  @Column({ type: 'varchar', length: 150 })
  PARAMETER: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  DESCRIPTION: string | null

  @Column({ type: 'text', nullable: true })
  VALUE: string | null

  @Column({ type: 'varchar', length: 50 })
  MENU_OPTION_ID: string

  @ManyToOne(() => MenuOption)
  @JoinColumn({ name: 'MENU_OPTION_ID' })
  MENU_OPTION: MenuOption
}
