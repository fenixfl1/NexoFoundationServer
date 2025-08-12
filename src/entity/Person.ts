import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Reference } from './Reference'
import { User } from './User'
import { Contact } from './Contact'

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

  @OneToMany(() => Reference, (ref) => ref.PERSON)
  REFERENCES: Reference[]

  @OneToOne(() => User, (usr) => usr.PERSON)
  USER: User

  @OneToMany(() => Contact, (c) => c.PERSON)
  CONTACTS: Contact[]
}
