import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { Request } from '@src/entity/Request'
import { NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { Student } from '@src/entity/Student'

interface CreateRequestPayload {
  PERSON_ID: number
  STUDENT_ID?: number | null
  REQUEST_TYPE: string
  STATUS?: Request['STATUS']
  ASSIGNED_COORDINATOR?: string | null
  NEXT_APPOINTMENT?: string | null
  COHORT?: string | null
  NOTES?: string | null
}

interface UpdateRequestPayload extends Partial<CreateRequestPayload> {
  REQUEST_ID: number
}

export class RequestService extends BaseService {
  private requestRepository: Repository<Request>
  private studentRepository: Repository<Student>

  constructor() {
    super()
    this.requestRepository = this.dataSource.getRepository(Request)
    this.studentRepository = this.dataSource.getRepository(Student)
  }

  @CatchServiceError()
  async create(
    payload: CreateRequestPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const { PERSON_ID, STUDENT_ID } = payload

    const person = await this.personRepository.findOne({
      where: { PERSON_ID },
    })

    if (!person) {
      throw new NotFoundError(
        `La persona con identificador '${PERSON_ID}' no fue encontrada.`
      )
    }

    if (STUDENT_ID) {
      const studentExists = await this.studentRepository.findOne({
        where: { STUDENT_ID },
      })

      if (!studentExists) {
        throw new NotFoundError(
          `El becario con identificador '${STUDENT_ID}' no fue encontrado.`
        )
      }
    }

    const request = this.requestRepository.create({
      ...payload,
      CREATED_BY: session.userId,
    })

    await this.requestRepository.save(request)

    return this.success({
      message: 'Solicitud registrada correctamente.',
      data: request,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateRequestPayload): Promise<ApiResponse> {
    const { REQUEST_ID, STUDENT_ID, ...rest } = payload

    const request = await this.requestRepository.findOne({
      where: { REQUEST_ID },
    })

    if (!request) {
      throw new NotFoundError(
        `La solicitud con código '${REQUEST_ID}' no fue encontrada.`
      )
    }

    if (STUDENT_ID) {
      const studentExists = await this.studentRepository.findOne({
        where: { STUDENT_ID },
      })

      if (!studentExists) {
        throw new NotFoundError(
          `El becario con identificador '${STUDENT_ID}' no fue encontrado.`
        )
      }
    }

    await this.requestRepository.update(
      { REQUEST_ID },
      { ...rest, STUDENT_ID }
    )

    return this.success({
      message: 'Solicitud actualizada.',
    })
  }

  @CatchServiceError()
  async get_pagination(
    payload: AdvancedCondition[],
    pagination: Pagination
  ): Promise<ApiResponse> {
    const { values, whereClause } = whereClauseBuilder(payload)

    const statement = `
      SELECT
        *
      FROM (
        SELECT
          r."REQUEST_ID",
          r."PERSON_ID",
          r."STUDENT_ID",
          r."REQUEST_TYPE",
          r."STATUS",
          r."ASSIGNED_COORDINATOR",
          r."NEXT_APPOINTMENT",
          r."COHORT",
          r."NOTES",
          p."NAME",
          p."LAST_NAME",
          p."IDENTITY_DOCUMENT",
          s."UNIVERSITY",
          s."CAREER",
          COALESCE(email."VALUE", '') AS "CONTACT_EMAIL",
          COALESCE(phone."VALUE", '') AS "CONTACT_PHONE",
          (
            p."NAME" || ' ' ||
            p."LAST_NAME" || ' ' ||
            p."IDENTITY_DOCUMENT" || ' ' ||
            COALESCE(s."UNIVERSITY", '') || ' ' ||
            COALESCE(s."CAREER", '') || ' ' ||
            COALESCE(r."REQUEST_TYPE", '')
          ) AS "FILTER"
        FROM PUBLIC."REQUEST" r
        INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = r."PERSON_ID"
        LEFT JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = r."STUDENT_ID"
        LEFT JOIN PUBLIC."CONTACT" email
          ON email."PERSON_ID" = p."PERSON_ID"
          AND email."IS_PRIMARY" = TRUE
          AND email."TYPE" = 'email'
        LEFT JOIN PUBLIC."CONTACT" phone
          ON phone."PERSON_ID" = p."PERSON_ID"
          AND phone."IS_PRIMARY" = TRUE
          AND phone."TYPE" = 'phone'
      ) AS SUBQUERY
      ${whereClause}
    `

    const [data, metadata] = await paginatedQuery<Request>({
      statement,
      values,
      pagination,
    })

    if (!data.length) {
      return this.success({ status: HTTP_STATUS_NO_CONTENT })
    }

    return this.success({ data, metadata })
  }

  @CatchServiceError()
  async get_request(requestId: number): Promise<ApiResponse> {
    const statement = `
      SELECT
        r.*,
        p."NAME",
        p."LAST_NAME",
        p."IDENTITY_DOCUMENT",
        s."UNIVERSITY",
        s."CAREER",
        COALESCE(email."VALUE", '') AS "CONTACT_EMAIL",
        COALESCE(phone."VALUE", '') AS "CONTACT_PHONE"
      FROM PUBLIC."REQUEST" r
      INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = r."PERSON_ID"
      LEFT JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = r."STUDENT_ID"
      LEFT JOIN PUBLIC."CONTACT" email
        ON email."PERSON_ID" = p."PERSON_ID"
        AND email."IS_PRIMARY" = TRUE
        AND email."TYPE" = 'email'
      LEFT JOIN PUBLIC."CONTACT" phone
        ON phone."PERSON_ID" = p."PERSON_ID"
        AND phone."IS_PRIMARY" = TRUE
        AND phone."TYPE" = 'phone'
      WHERE r."REQUEST_ID" = $1
    `

    const [request] = await queryRunner<Request>(statement, [requestId])

    if (!request) {
      throw new NotFoundError(
        `La solicitud con código '${requestId}' no fue encontrada.`
      )
    }

    return this.success({ data: request })
  }
}
