import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm'
import { Permission } from './Permission'
import { Role } from './Role'
import { BaseEntity } from './BaseEntity'

@Entity({ name: 'PERMISSION_X_ROLE' })
export class PermissionRole extends BaseEntity {
  @PrimaryColumn({ type: 'integer' })
  PERMISSION_ID: number

  @PrimaryColumn({ type: 'integer' })
  ROLE_ID: number

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'PERMISSION_ID' })
  PERMISSION: Permission

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'ROLE_ID' })
  ROLE: Role
}
