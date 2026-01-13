import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { Scholarship } from '@src/entity/Scholarship'
import { Student } from '@src/entity/Student'
import { Request } from '@src/entity/Request'
import { NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateScholarshipPayload {
  STUDENT_ID: number
  REQUEST_ID?: number | null
  NAME: string
  DESCRIPTION?: string | null
  AMOUNT: number
  START_DATE: string | Date
  END_DATE?: string | Date | null
  PERIOD_TYPE?: string
  STATUS?: string
}

interface UpdateScholarshipPayload extends Partial<CreateScholarshipPayload> {
  SCHOLARSHIP_ID: number
}

export class ScholarshipService extends BaseService {
  private scholarshipRepository: Repository<Scholarship>
  private studentRepository: Repository<Student>
  private requestRepository: Repository<Request>

  constructor() {
    super()
    this.scholarshipRepository = this.dataSource.getRepository(Scholarship)
    this.studentRepository = this.dataSource.getRepository(Student)
    this.requestRepository = this.dataSource.getRepository(Request)
  }

  @CatchServiceError()
  async create(
    payload: CreateScholarshipPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    await this.ensureRelations(payload)

    const scholarship = this.scholarshipRepository.create({
      ...payload,
      START_DATE: new Date(payload.START_DATE),
      END_DATE: payload.END_DATE ? new Date(payload.END_DATE) : null,
      STATUS: payload.STATUS ?? 'P',
      PERIOD_TYPE: payload.PERIOD_TYPE ?? 'S',
      CREATED_BY: session.userId,
    })

    await this.scholarshipRepository.save(scholarship)

    return this.success({
      message: 'Beca registrada correctamente.',
      data: scholarship,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateScholarshipPayload): Promise<ApiResponse> {
    const { SCHOLARSHIP_ID, ...rest } = payload

    const scholarship = await this.scholarshipRepository.findOne({
      where: { SCHOLARSHIP_ID },
    })

    if (!scholarship) {
      throw new NotFoundError(
        `La beca con id '${SCHOLARSHIP_ID}' no existe.`
      )
    }

    await this.ensureRelations(rest as CreateScholarshipPayload)

    await this.scholarshipRepository.update(
      { SCHOLARSHIP_ID },
      {
        ...rest,
        START_DATE: rest.START_DATE
          ? new Date(rest.START_DATE)
          : scholarship.START_DATE,
        END_DATE:
          rest.END_DATE !== undefined
            ? rest.END_DATE
              ? new Date(rest.END_DATE)
              : null
            : scholarship.END_DATE,
      }
    )

    if (rest.STATUS === 'A' && scholarship.STATUS !== 'A') {
      await this.dataSource.query(
        `
          INSERT INTO "DISBURSEMENT" (
            "CREATED_AT",
            "CREATED_BY",
            "STATE",
            "SCHOLARSHIP_ID",
            "COST_ID",
            "AMOUNT",
            "DISBURSEMENT_DATE",
            "STATUS"
          )
          SELECT
            NOW(),
            NULL,
            'A',
            c."SCHOLARSHIP_ID",
            c."COST_ID",
            c."AMOUNT",
            c."PERIOD_END",
            'P'
          FROM "SCHOLARSHIP_COST_HISTORY" c
          WHERE c."SCHOLARSHIP_ID" = $1
            AND c."STATE" = 'A'
            AND NOT EXISTS (
              SELECT 1 FROM "DISBURSEMENT" d
              WHERE d."COST_ID" = c."COST_ID"
            )
        `,
        [SCHOLARSHIP_ID]
      )
    }

    return this.success({ message: 'Beca actualizada correctamente.' })
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
          sc."SCHOLARSHIP_ID",
          sc."STUDENT_ID",
          sc."REQUEST_ID",
          sc."NAME",
          sc."DESCRIPTION",
          sc."AMOUNT",
          sc."START_DATE",
          sc."END_DATE",
          sc."PERIOD_TYPE",
          sc."STATUS",
          sc."STATE",
          sc."CREATED_AT",
          p."NAME" AS "STUDENT_NAME",
          p."LAST_NAME" AS "STUDENT_LAST_NAME",
          p."IDENTITY_DOCUMENT",
          s."UNIVERSITY",
          s."CAREER",
          r."REQUEST_TYPE",
          (
            p."NAME" || ' ' ||
            p."LAST_NAME" || ' ' ||
            p."IDENTITY_DOCUMENT" || ' ' ||
            sc."NAME" || ' ' ||
            COALESCE(sc."DESCRIPTION", '')
          ) AS "FILTER"
        FROM PUBLIC."SCHOLARSHIP" sc
        INNER JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = sc."STUDENT_ID"
        INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = s."PERSON_ID"
        LEFT JOIN PUBLIC."REQUEST" r ON r."REQUEST_ID" = sc."REQUEST_ID"
      ) AS scholarship_subquery
      ${whereClause}
      ORDER BY "SCHOLARSHIP_ID" DESC
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
  async get_scholarship(scholarshipId: number): Promise<ApiResponse> {
    const statement = `
      SELECT
        sc.*,
        p."NAME" AS "STUDENT_NAME",
        p."LAST_NAME" AS "STUDENT_LAST_NAME",
        p."IDENTITY_DOCUMENT"
      FROM PUBLIC."SCHOLARSHIP" sc
      INNER JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = sc."STUDENT_ID"
      INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = s."PERSON_ID"
      WHERE sc."SCHOLARSHIP_ID" = $1
    `

    const [scholarship] = await queryRunner<Scholarship>(statement, [
      scholarshipId,
    ])

    if (!scholarship) {
      throw new NotFoundError(
        `La beca con id '${scholarshipId}' no existe.`
      )
    }

    return this.success({ data: scholarship })
  }

  private async ensureRelations(
    payload: Partial<CreateScholarshipPayload>
  ): Promise<void> {
    if (payload.STUDENT_ID) {
      const exists = await this.studentRepository.findOne({
        where: { STUDENT_ID: payload.STUDENT_ID },
      })
      if (!exists) {
        throw new NotFoundError(
          `El becario con id '${payload.STUDENT_ID}' no existe.`
        )
      }
    }

    if (payload.REQUEST_ID) {
      const exists = await this.requestRepository.findOne({
        where: { REQUEST_ID: payload.REQUEST_ID },
      })
      if (!exists) {
        throw new NotFoundError(
          `La solicitud con id '${payload.REQUEST_ID}' no existe.`
        )
      }
    }
  }
}
