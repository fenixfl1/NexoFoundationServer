import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './User'

@Entity('PASSWORD_RESET_TOKENS')
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  ID: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'USER_ID' })
  USER: User

  @Column()
  TOKEN: string

  @Column({ type: 'timestamp' })
  EXPIRES_AT: Date

  @CreateDateColumn()
  CREATED_AT: Date
}

export default PasswordResetToken
