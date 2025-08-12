import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import ms from 'ms'
import { BadRequestError, UnAuthorizedError } from '@src/errors/http.error'
import { BaseService } from './base.service'
import moment from 'moment'
import { normalizeUnit } from '@src/helpers/normalize-unit'

interface LoginPayload {
  username: string
  password: string
}

export class AuthService extends BaseService {
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
}
