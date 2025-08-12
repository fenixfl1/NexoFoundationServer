import * as bcrypt from 'bcrypt'
import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'
import { NotFoundError, UnAuthorizedError } from '@src/errors/http.error'
import { User } from '@src/entity/User'

interface ChangePasswordPayload {
  USERNAME: string
  OLD_PASSWORD: string
  NEW_PASSWORD: string
}

export class UserService extends BaseService {
  @CatchServiceError()
  async get_pagination(
    payload: AdvancedCondition[],
    pagination: Pagination
  ): Promise<ApiResponse> {
    const { whereClause, values } = whereClauseBuilder(payload)

    const statement = `
      SELECT 
        *
      FROM (
        SELECT
          U.*,
          P."IDENTITY_DOCUMENT",
          P."NAME" || ' ' || P."LAST_NAME" AS "FULL_NAME",
          STRING_AGG(R."NAME", ', ') AS "ROLES",
          U."USERNAME" || ' ' || P."NAME" || ' ' || P."LAST_NAME" || ' ' || P."IDENTITY_DOCUMENT" AS "FILTER"
        FROM 
          public."USER" U
          LEFT JOIN public."PERSON" P ON P."PERSON_ID" = U."PERSON_ID"
          LEFT JOIN public."ROLES_X_USER" RXU ON U."USER_ID" = RXU."USER_ID" AND RXU."STATE" = 'A'
          LEFT JOIN public."ROLE" R ON RXU."ROLE_ID" = R."ROLE_ID" AND R."STATE" = 'A'
        GROUP BY
          U."CREATED_AT",  U."CREATED_BY", U."STATE",
          U."USER_ID",  P."IDENTITY_DOCUMENT",P."NAME", P."LAST_NAME"
      ) AS SUBQUERY
      ${whereClause}
    `

    const [data = [], metadata] = await paginatedQuery({
      statement,
      values,
      pagination,
    })

    if (!data.length) {
      return this.success({ status: HTTP_STATUS_NO_CONTENT })
    }

    return this.success({ data, metadata })
  }

  /**
   * change user password
   * @param payload - username, old password and new password
   * @return { message: 'Password changed successfully.' }
   */
  @CatchServiceError()
  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse> {
    const { USERNAME, OLD_PASSWORD, NEW_PASSWORD } = payload
    const user = await this.userRepository.findOne({
      where: { USERNAME },
    })

    if (!user) {
      throw new NotFoundError('Usuario no encontrado.')
    }

    if (!(await bcrypt.compare(OLD_PASSWORD, user.PASSWORD))) {
      throw new UnAuthorizedError('La contraseña actual no es correcta.')
    }

    user.PASSWORD = await bcrypt.hash(NEW_PASSWORD, 10)
    await this.userRepository.save(user)

    return this.success({ message: 'Contraseña actualizada con  éxito.' })
  }

  @CatchServiceError()
  async update(payload: User): Promise<ApiResponse> {
    const { USERNAME, USER_ID, ...restProps } = payload

    const user = await this.userRepository.findOne({
      where: { USERNAME, USER_ID },
    })
    if (!user) {
      throw new NotFoundError('Usuario no encontrado.')
    }

    const newUser = await this.userRepository.update(
      { USERNAME, USER_ID },
      { ...restProps }
    )

    return this.success({ data: newUser, message: 'Usuario' })
  }
}
