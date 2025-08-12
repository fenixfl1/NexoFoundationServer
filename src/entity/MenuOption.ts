import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Permission } from './Permission'

@Entity('MENU_OPTION')
export class MenuOption extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  MENU_OPTION_ID: string

  @Column({ type: 'varchar', length: 100 })
  NAME: string

  @Column({ type: 'varchar', length: 250, nullable: true })
  DESCRIPTION?: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  PATH?: string

  @Column({
    type: 'enum',
    nullable: true,
    enum: ['group', 'divider', 'link', 'item', 'submenu'],
  })
  TYPE?: string

  @Column({ type: 'text', nullable: true })
  ICON?: string

  @Column({ nullable: false, type: 'integer' })
  ORDER: number

  @Column({ type: 'varchar', nullable: true })
  PARENT_ID: string

  @ManyToOne(() => MenuOption, { nullable: true })
  @JoinColumn({ name: 'PARENT_ID' })
  PARENT?: MenuOption

  @OneToMany(() => MenuOption, (option) => option.PARENT)
  CHILDREN: MenuOption[]

  @OneToMany(() => Permission, (permission) => permission.MENU_OPTION)
  PERMISSIONS: Permission[]
}
