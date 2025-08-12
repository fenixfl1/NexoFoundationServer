import {
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
  BaseEntity as Base,
  JoinColumn,
} from 'typeorm'

export abstract class BaseEntity {
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CREATED_AT: Date | null

  @Column({ type: 'integer', nullable: true })
  CREATED_BY?: number

  @Column({ type: 'char', length: 1, default: 'A' })
  STATE: string | null
}
