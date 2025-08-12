import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('BUSINESS')
export class Business {
  @PrimaryColumn({ type: 'integer' })
  BUSINESS_ID: number

  @Column({ type: 'varchar' })
  NAME: string

  @Column({ type: 'bytea' })
  LOGO: string

  @Column({ type: 'varchar' })
  RNC: string

  @Column({ type: 'varchar' })
  PHONE: string

  @Column({ type: 'text' })
  ADDRESS: string

  @Column({ type: 'char' })
  STATE: string
}
