import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Reference } from './Reference'
import { User } from './User'
import { Contact } from './Contact'
import { Role } from './Role'

@Entity('PERSON')
export class Person extends BaseEntity {
  @PrimaryGeneratedColumn()
  PERSON_ID: number

  @Column({ type: 'varchar', nullable: false })
  NAME: string

  @Column({ type: 'varchar', nullable: false })
  LAST_NAME: string

  @Column({ type: 'char', nullable: false })
  GENDER: string

  @Column({ type: 'date', nullable: false })
  BIRTH_DATE: Date

  @Column({ type: 'varchar', nullable: false })
  IDENTITY_DOCUMENT: string

  @Column({ type: 'integer', nullable: true })
  ROLE_ID: number

  @ManyToOne(() => Role, (role) => role.PEOPLE)
  @JoinColumn({ name: 'ROLE_ID' })
  ROLE: Role

  @OneToMany(() => Reference, (ref) => ref.PERSON)
  REFERENCES: Reference[]

  @OneToOne(() => User, (usr) => usr.PERSON)
  USER: User

  @OneToMany(() => Contact, (c) => c.PERSON)
  CONTACTS: Contact[]
}
