import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { MenuOption } from './MenuOption'
import { UserRoles } from './RolesUser'

@Entity('ROLE')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  ROLE_ID: number

  @Column({ type: 'varchar', unique: true, length: 30, nullable: false })
  NAME: string

  @Column({ type: 'varchar', length: 250 })
  DESCRIPTION: string

  @OneToMany(() => UserRoles, (rolesXUser) => rolesXUser.ROLE)
  ROLES_X_USER: UserRoles[]
}
