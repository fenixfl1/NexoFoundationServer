import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import {
  NotificationChannel,
  NotificationTemplate,
} from './NotificationTemplate'
import { User } from './User'

export enum NotificationStatus {
  PENDING = 'P',
  SCHEDULED = 'C',
  SENT = 'S',
  FAILED = 'F',
}

@Entity('NOTIFICATION')
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  NOTIFICATION_ID: number

  @Column({ type: 'integer', nullable: true })
  TEMPLATE_ID: number | null

  @ManyToOne(() => NotificationTemplate, { nullable: true })
  @JoinColumn({ name: 'TEMPLATE_ID' })
  TEMPLATE: NotificationTemplate | null

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    enumName: 'NOTIFICATION_channel_enum',
  })
  CHANNEL: NotificationChannel

  @Column({ type: 'varchar', length: 255 })
  RECIPIENT: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  SUBJECT: string | null

  @Column({ type: 'text' })
  BODY: string

  @Column({ type: 'jsonb', nullable: true })
  PAYLOAD: Record<string, unknown> | null

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    enumName: 'NOTIFICATION_status_enum',
    default: NotificationStatus.PENDING,
  })
  STATUS: NotificationStatus

  @Column({ type: 'varchar', length: 100, nullable: true })
  RELATED_ENTITY: string | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  RELATED_ID: string | null

  @Column({ type: 'timestamp', nullable: true })
  SCHEDULED_AT: Date | null

  @Column({ type: 'timestamp', nullable: true })
  SENT_AT: Date | null

  @Column({ type: 'integer', nullable: true })
  SENT_BY: number | null

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'SENT_BY' })
  SENT_BY_USER: User | null

  @Column({ type: 'text', nullable: true })
  ERROR_MESSAGE: string | null
}
