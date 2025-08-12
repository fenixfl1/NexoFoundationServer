import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Role } from './Role'
import { User } from './User'

@Entity('ROLES_X_USER')
export class UserRoles extends BaseEntity {
  @PrimaryColumn({ type: 'integer' })
  USER_ID: number

  @PrimaryColumn({ type: 'integer' })
  ROLE_ID: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'USER_ID' })
  USER: User

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'ROLE_ID' })
  ROLE: Role
}
