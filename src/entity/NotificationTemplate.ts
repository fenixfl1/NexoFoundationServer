import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { MenuOption } from './MenuOption'

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
}

@Entity('NOTIFICATION_TEMPLATE')
export class NotificationTemplate extends BaseEntity {
  @PrimaryGeneratedColumn()
  TEMPLATE_ID: number

  @Column({ type: 'varchar', length: 150, unique: true })
  TEMPLATE_KEY: string

  @Column({ type: 'varchar', length: 150 })
  NAME: string

  @Column({ type: 'text', nullable: true })
  DESCRIPTION: string | null

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    enumName: 'NOTIFICATION_channel_enum',
  })
  CHANNEL: NotificationChannel

  @Column({ type: 'varchar', length: 255, nullable: true })
  SUBJECT: string | null

  @Column({ type: 'text' })
  BODY: string

  @Column({ type: 'jsonb', nullable: true })
  PARAMETERS: Record<string, unknown> | null

  @Column({ type: 'jsonb', nullable: true })
  DEFAULTS: Record<string, unknown> | null

  @Column({ type: 'varchar', length: 50, nullable: true })
  MENU_OPTION_ID: string | null

  @ManyToOne(() => MenuOption, { nullable: true })
  @JoinColumn({ name: 'MENU_OPTION_ID' })
  MENU_OPTION: MenuOption | null
}
