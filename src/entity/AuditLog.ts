import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './User'

@Entity('AUDIT_LOG')
export class AuditLog {
  @PrimaryGeneratedColumn()
  AUDIT_LOG_ID: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  ACTION_AT: Date

  @Column({ type: 'integer' })
  USER_ID: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'USER_ID' })
  USER: User

  @Column({ type: 'varchar', length: 100 })
  ENTITY_TYPE: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  ENTITY_ID?: string | null

  @Column({ type: 'varchar', length: 200 })
  ENTITY_LABEL: string

  @Column({ type: 'char', length: 1 })
  ACTION: string

  @Column({ type: 'text', nullable: true })
  MESSAGE?: string | null

  @Column({ type: 'jsonb', nullable: true })
  PAYLOAD?: Record<string, unknown> | null

  @Column({ type: 'varchar', length: 45, nullable: true })
  IP_ADDRESS?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  USER_AGENT?: string | null
}
