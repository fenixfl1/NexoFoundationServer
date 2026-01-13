import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { Disbursement } from '@src/entity/Disbursement'
import { Scholarship } from '@src/entity/Scholarship'
import { NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateDisbursementPayload {
  SCHOLARSHIP_ID: number
  COST_ID?: number | null
  AMOUNT: number
  DISBURSEMENT_DATE: string | Date
  METHOD?: string | null
  REFERENCE?: string | null
  STATUS?: string
  NOTES?: string | null
}

interface UpdateDisbursementPayload extends Partial<CreateDisbursementPayload> {
  DISBURSEMENT_ID: number
}

export class DisbursementService extends BaseService {
  private disbursementRepository: Repository<Disbursement>
  private scholarshipRepository: Repository<Scholarship>

  constructor() {
    super()
    this.disbursementRepository = this.dataSource.getRepository(Disbursement)
    this.scholarshipRepository = this.dataSource.getRepository(Scholarship)
  }

  @CatchServiceError()
  async create(
    payload: CreateDisbursementPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    await this.ensureScholarship(payload.SCHOLARSHIP_ID)

    const disbursement = this.disbursementRepository.create({
      ...payload,
      DISBURSEMENT_DATE: new Date(payload.DISBURSEMENT_DATE),
      STATUS: payload.STATUS ?? 'P',
      CREATED_BY: session.userId,
    })

    await this.disbursementRepository.save(disbursement)

    return this.success({
      message: 'Desembolso registrado correctamente.',
      data: disbursement,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateDisbursementPayload): Promise<ApiResponse> {
    const { DISBURSEMENT_ID, ...rest } = payload

    const disbursement = await this.disbursementRepository.findOne({
      where: { DISBURSEMENT_ID },
    })

    if (!disbursement) {
      throw new NotFoundError(
        `El desembolso con id '${DISBURSEMENT_ID}' no existe.`
      )
    }

    if (rest.SCHOLARSHIP_ID) {
      await this.ensureScholarship(rest.SCHOLARSHIP_ID)
    }

    await this.disbursementRepository.update(
      { DISBURSEMENT_ID },
      {
        ...rest,
        DISBURSEMENT_DATE: rest.DISBURSEMENT_DATE
          ? new Date(rest.DISBURSEMENT_DATE)
          : disbursement.DISBURSEMENT_DATE,
      }
    )

    return this.success({ message: 'Desembolso actualizado correctamente.' })
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
          d."DISBURSEMENT_ID",
          d."SCHOLARSHIP_ID",
          d."COST_ID",
          d."AMOUNT",
          d."DISBURSEMENT_DATE",
          d."METHOD",
          d."REFERENCE",
          d."STATUS",
          d."NOTES",
          d."STATE",
          d."CREATED_AT",
          s."NAME" AS "SCHOLARSHIP_NAME",
          s."STUDENT_ID",
          p."NAME" AS "STUDENT_NAME",
          p."LAST_NAME" AS "STUDENT_LAST_NAME",
          p."IDENTITY_DOCUMENT",
          (
            p."NAME" || ' ' ||
            p."LAST_NAME" || ' ' ||
            p."IDENTITY_DOCUMENT" || ' ' ||
            s."NAME" || ' ' ||
            COALESCE(d."REFERENCE", '')
          ) AS "FILTER"
        FROM PUBLIC."DISBURSEMENT" d
        INNER JOIN PUBLIC."SCHOLARSHIP" s
          ON s."SCHOLARSHIP_ID" = d."SCHOLARSHIP_ID"
        INNER JOIN PUBLIC."STUDENT" st ON st."STUDENT_ID" = s."STUDENT_ID"
        INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = st."PERSON_ID"
      ) AS disbursement_subquery
      ${whereClause}
      ORDER BY "DISBURSEMENT_DATE" DESC
    `

    const [data = [], metadata] = await paginatedQuery({
      statement,
      values,
      pagination,
    })

    if (!data.length) {
      return this.success({ status: HTTP_STATUS_NO_CONTENT })
    }

    const summaryStatement = `
      SELECT
        summary_subquery."STATUS",
        COUNT(*)::INTEGER AS "COUNT"
      FROM (${statement}) AS summary_subquery
      GROUP BY summary_subquery."STATUS"
    `

    const summaryRows = await queryRunner<{ STATUS: string; COUNT: number }>(
      summaryStatement,
      values
    )

    const summary = summaryRows.reduce((acc, { STATUS, COUNT }) => {
      acc[STATUS] = COUNT
      return acc
    }, {})

    return this.success({ data, metadata: { ...metadata, summary } })
  }

  @CatchServiceError()
  async get_disbursement(disbursementId: number): Promise<ApiResponse> {
    const statement = `
      SELECT
        d.*,
        s."NAME" AS "SCHOLARSHIP_NAME",
        p."NAME" AS "STUDENT_NAME",
        p."LAST_NAME" AS "STUDENT_LAST_NAME",
        p."IDENTITY_DOCUMENT"
      FROM PUBLIC."DISBURSEMENT" d
      INNER JOIN PUBLIC."SCHOLARSHIP" s
        ON s."SCHOLARSHIP_ID" = d."SCHOLARSHIP_ID"
      INNER JOIN PUBLIC."STUDENT" st ON st."STUDENT_ID" = s."STUDENT_ID"
      INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = st."PERSON_ID"
      WHERE d."DISBURSEMENT_ID" = $1
    `

    const [disbursement] = await queryRunner<Disbursement>(statement, [
      disbursementId,
    ])

    if (!disbursement) {
      throw new NotFoundError(
        `El desembolso con id '${disbursementId}' no existe.`
      )
    }

    return this.success({ data: disbursement })
  }

  private async ensureScholarship(scholarshipId: number) {
    const exists = await this.scholarshipRepository.findOne({
      where: { SCHOLARSHIP_ID: scholarshipId },
    })

    if (!exists) {
      throw new NotFoundError(
        `La beca con id '${scholarshipId}' no existe.`
      )
    }
  }
}
