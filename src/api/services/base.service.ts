import { INTERNAL_SERVER_ERROR } from '@src/constants/error-types'
import {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_OK,
} from '@src/constants/status-codes'
import { AppDataSource } from '@src/data-source'
import { UserRoles } from '@src/entity'
import { Business } from '@src/entity/Business'
import { Person } from '@src/entity/Person'
import { User } from '@src/entity/User'
import { BaseError } from '@src/errors/base.error'
import { NotFoundError } from '@src/errors/http.error'
import { parseOracleError } from '@src/errors/ParseOracleErrors'
import { ApiResponse, Metadata } from '@src/types/api.types'
import {
  DataSource,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm'

interface SuccessResponse<T> {
  data?: T
  message?: string
  metadata?: Metadata
  status?: number
}

interface GetUserOptions {
  relations?: FindOptionsRelations<User>
  searchKey?: keyof User
  throwError?: boolean
}

export abstract class BaseService {
  protected dataSource: DataSource
  protected businessRepository: Repository<Business>
  protected personRepository: Repository<Person>
  protected userRepository: Repository<User>
  protected userRolesRepository: Repository<UserRoles>

  constructor() {
    this.dataSource = AppDataSource
    this.businessRepository = this.dataSource.getRepository(Business)
    this.personRepository = this.dataSource.getRepository(Person)
    this.userRepository = this.dataSource.getRepository(User)
    this.userRolesRepository = this.dataSource.getRepository(UserRoles)
  }

  protected async getStudents(user_id: number): Promise<Person[]> {
    const students = await this.personRepository
      .createQueryBuilder('student')
      .innerJoin('student.USER', 'user')
      .innerJoin('ROLES_X_USER', 'rxu', 'rxu.USER_ID = user.USER_ID')
      .innerJoin('ROLE', 'r')
      .where('rxu.USER_ID = :user_id', { user_id })
      .andWhere('r.NAME ILIKE :name', { name: '%student%' })
      .getMany()

    if (!students?.length) {
      throw new NotFoundError('Estudiante no encontrado.')
    }

    return students
  }

  protected success<T>({
    data,
    message,
    metadata,
    status = HTTP_STATUS_OK,
  }: SuccessResponse<T>): ApiResponse<T> {
    return {
      status,
      message,
      data,
      metadata,
    }
  }

  protected noContent(): ApiResponse<any> {
    return this.success({ status: HTTP_STATUS_NO_CONTENT })
  }

  protected fail(
    message: string,
    status: number = HTTP_STATUS_INTERNAL_SERVER_ERROR,
    code: string = INTERNAL_SERVER_ERROR
  ): void {
    throw new BaseError(status, message, code)
  }

  protected async getBusinessInfo(
    select?: (keyof Business)[]
  ): Promise<Business> {
    const business = await this.businessRepository.findOne({
      select,
      where: {
        STATE: 'A',
      },
    })

    if (!business) {
      throw new NotFoundError(`Empresa no encontrada.`)
    }

    return business
  }

  protected async getUser(
    value: string | number,
    options?: GetUserOptions
  ): Promise<User> {
    const {
      relations = null,
      searchKey = 'USERNAME',
      throwError = true,
    } = options

    const user = await this.userRepository.findOne({
      relations,
      where: { [searchKey]: value },
    })

    if (!user && throwError) {
      throw new NotFoundError(`Usuario "${value}" no encontrado.`)
    }

    return user
  }

  protected async getPerson(
    personId: number,
    relations: FindOptionsRelations<Person> = { CONTACTS: true }
  ): Promise<Person> {
    const person = await this.personRepository.findOne({
      relations,
      where: { PERSON_ID: personId },
    })

    if (!person) {
      throw new NotFoundError(`Persona con id '${personId}' no encontrada.`)
    }

    return person
  }
}

/**
 * Method decorator to automatically catch and handle errors in service methods.
 *
 * This decorator is intended to be used on methods inside services that extend
 * from `BaseService`, which provides a `fail()` method.
 *
 * If the error is an instance of `BaseError`, it will call `this.fail()` with
 * the specific error message, status code, and error name. Otherwise, it calls
 * `this.fail()` with a generic error message.
 *
 * @example
 * ```typescript
 * CatchServiceError()
 * async someServiceMethod() {
 *   // Your method logic
 * }
 * ```
 *
 * @returns A wrapped method with centralized error handling.
 */
export function CatchServiceError() {
  return function (target: any, propertyKey: string, descriptor: any) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error: any) {
        if (error instanceof BaseError) {
          this.fail(error.message, error.status, error.name)
        }

        const oraError = parseOracleError(error)
        if (oraError) {
          this.fail(
            `${oraError.message}. ${oraError.code}`,
            HTTP_STATUS_INTERNAL_SERVER_ERROR,
            oraError.type
          )
        }

        this.fail(error.message)
      }
    }

    return descriptor
  }
}
