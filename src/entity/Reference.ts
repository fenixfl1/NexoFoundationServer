import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Person } from './Person'

@Entity('REFERENCE')
export class Reference extends BaseEntity {
  @PrimaryGeneratedColumn()
  REFERENCE_ID: number

  @Column({ type: 'integer', nullable: false })
  PERSON_ID: number

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'PERSON_ID' })
  PERSON: Person

  @Column({ type: 'varchar', nullable: false })
  FULL_NAME: string

  @Column({ type: 'varchar' })
  RELATIONSHIP: string

  @Column({ type: 'varchar' })
  PHONE: string

  @Column({ type: 'varchar', nullable: true })
  EMAIL: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  ADDRESS: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  NOTES: string
}
