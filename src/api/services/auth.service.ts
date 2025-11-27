import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import ms from 'ms'
import { BadRequestError, UnAuthorizedError } from '@src/errors/http.error'
import { BaseService, CatchServiceError } from './base.service'
import moment from 'moment'
import { normalizeUnit } from '@src/helpers/normalize-unit'
import { publishEmailToQueue } from './email/email-producer.service'
import PasswordResetToken from '@src/entity/PasswordReset'
import { Repository } from 'typeorm'
import { randomBytes } from 'node:crypto'
import { ApiResponse } from '@src/types/api.types'
import { generatePassword } from '@src/helpers/generate-password'
import { Contact, ContactType } from '@src/entity'

interface LoginPayload {
  username: string
  password: string
}

export class AuthService extends BaseService {
  private contactRepository: Repository<Contact>
  private resetPasswordRepository: Repository<PasswordResetToken>

  constructor() {
    super()
    this.contactRepository = this.dataSource.getRepository(Contact)
    this.resetPasswordRepository =
      this.dataSource.getRepository(PasswordResetToken)
  }

  async login({ username, password }: LoginPayload) {
    const user = await this.userRepository.findOne({
      where: { USERNAME: username },
      relations: ['PERSON'],
    })

    const isPasswordValid = await bcrypt.compare(password, user?.PASSWORD || '')
    if (!isPasswordValid || !user) {
      throw new UnAuthorizedError('Usuario o contraseña incorrectos')
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new BadRequestError('JWT_SECRET no configurado')
    }

    const token = jwt.sign(
      {
        username,
        userId: user.USER_ID,
      },
      secret,
      {
        expiresIn: (process.env.SESSION_EXPIRATION_TIME +
          process.env.SESSION_EXPIRATION_MAGNITUDE) as ms.StringValue,
      }
    )

    return this.success({
      data: {
        username,
        userId: user.USER_ID,
        name: `${user.PERSON.NAME} ${user.PERSON.LAST_NAME}`,
        avatar: user.AVATAR,
        sessionCookie: {
          expiration: this.getSessionExpirationDate(),
          token,
        },
      },
    })
  }

  private getSessionExpirationDate(): string {
    const date = moment()
    const magnitude = normalizeUnit(
      process.env.SESSION_EXPIRATION_MAGNITUDE as ms.Unit
    )

    const expiration = date.add(
      Number(process.env.SESSION_EXPIRATION_TIME),
      magnitude
    )

    return expiration.toISOString()
  }

  @CatchServiceError()
  async requestPasswordReset(
    EMAIL: string,
    USERNAME: string
  ): Promise<ApiResponse> {
    const user = await this.getUser(USERNAME)
    const person = await this.getPerson(user.PERSON_ID)
    const business = await this.getBusinessInfo()

    if (!person?.CONTACTS?.some((c) => c.VALUE === EMAIL && c.IS_PRIMARY)) {
      this.fail('No pudimos validar su información')
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 1)

    const resetToken = this.resetPasswordRepository.create({
      USER: user,
      TOKEN: token,
      EXPIRES_AT: expiresAt,
    })
    await this.resetPasswordRepository.save(resetToken)

    const url = `${
      process.env.APP_URL
    }/reset_password/${token}?expires=${expiresAt.getTime()}`

    await publishEmailToQueue({
      to: EMAIL,
      subject: 'Recuperación de contraseña',
      templateName: 'forgot-password',
      text: '',
      record: {
        name: `${person.NAME} ${person.LAST_NAME}`,
        business,
        url,
        year: new Date().getFullYear(),
      },
    })

    return this.success({
      message:
        'Hemos enviado un correo electrónico con las instrucciones para recuperar tu contraseña.',
    })
  }

  @CatchServiceError()
  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const tokenRecord = await this.resetPasswordRepository.findOne({
      where: { TOKEN: token },
      relations: ['USER'],
    })

    if (!tokenRecord || tokenRecord.EXPIRES_AT < new Date()) {
      throw new Error('Token inválido o expirado')
    }

    const user = tokenRecord.USER
    const person = await this.getPerson(user.PERSON_ID)
    const business = await this.getBusinessInfo()

    const { hash } = await generatePassword(password)

    user.PASSWORD = hash

    const mainContact = person.CONTACTS.find(
      (c) => c.STATE === ContactType.EMAIL && c.IS_PRIMARY
    )

    await this.userRepository.save(user)
    await this.resetPasswordRepository.delete(tokenRecord)

    await publishEmailToQueue({
      to: mainContact.VALUE,
      subject: 'Recuperación de contraseña',
      templateName: 'password-changed',
      text: '',
      record: {
        name: `${person.NAME} ${person.LAST_NAME}`,
        business,
        url: `${process.env.APP_URL}/login`,
        year: new Date().getFullYear(),
      },
    })

    return this.success({
      message:
        'Su contraseña ha sido actualizada correctamente. Ya puede iniciar sesión.',
    })
  }
}
