import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Person } from './Person'

export enum ContactType {
  EMAIL = 'email',
  PHONE = 'phone',
  WHATSAPP = 'whatsapp',
  OTHER = 'other',
}

export enum ContactUsage {
  PERSONAL = 'personal',
  INSTITUTIONAL = 'institutional',
  EMERGENCY = 'emergency',
}

@Index(['PERSON_ID', 'TYPE', 'USAGE', 'VALUE'], { unique: true })
@Entity('CONTACT')
export class Contact extends BaseEntity {
  @PrimaryGeneratedColumn()
  CONTACT_ID: number

  @Column({ type: 'integer' })
  PERSON_ID: number

  @ManyToOne(() => Person, (per) => per.CONTACTS)
  @JoinColumn({ name: 'PERSON_ID' })
  PERSON: Person

  @Column({
    type: 'enum',
    enum: ContactType,
    default: ContactType.EMAIL,
  })
  TYPE: ContactType

  @Column({
    type: 'enum',
    enum: ContactUsage,
    default: ContactUsage.PERSONAL,
  })
  USAGE: ContactUsage

  @Column({ type: 'varchar', length: 255 })
  VALUE: string

  @Column({ type: 'boolean', default: false })
  IS_PRIMARY: boolean
}
