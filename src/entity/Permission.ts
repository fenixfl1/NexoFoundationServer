import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { MenuOption } from './MenuOption'
import { Action } from './Action'
import { BaseEntity } from './BaseEntity'
import { PermissionRole } from './PermissionRole'

@Entity({ name: 'PERMISSION' })
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn()
  PERMISSION_ID: number

  @Column({ type: 'varchar' })
  MENU_OPTION_ID: string

  @Column({ type: 'integer' })
  ACTION_ID: string

  @ManyToOne(() => MenuOption)
  @JoinColumn({ name: 'MENU_OPTION_ID' })
  MENU_OPTION: MenuOption

  @ManyToOne(() => Action)
  @JoinColumn({ name: 'ACTION_ID' })
  ACTION: Action

  @Column({ type: 'varchar', length: 255, nullable: true })
  DESCRIPTION: string | null

  @OneToMany(() => PermissionRole, (pxr) => pxr.PERMISSION)
  PERMISSION_X_ROLE: PermissionRole[]
}
