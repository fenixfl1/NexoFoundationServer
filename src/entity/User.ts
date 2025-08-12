import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Person } from './Person'
import { UserRoles } from './RolesUser'
import { JoinColumn } from 'typeorm'

@Entity('USER')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  USER_ID: number

  @Column({ type: 'varchar', length: 25, unique: true })
  USERNAME: string

  @Column({ type: 'integer' })
  PERSON_ID: number

  @OneToOne(() => Person, (person) => person.USER)
  @JoinColumn({ name: 'PERSON_ID' })
  PERSON: Person

  @Column({ type: 'varchar', length: 255 })
  PASSWORD: string

  @OneToMany(() => UserRoles, (rolesXUser) => rolesXUser.USER)
  ROLES_X_USER: UserRoles[]

  @Column({ type: 'text', nullable: true })
  AVATAR: string
}
