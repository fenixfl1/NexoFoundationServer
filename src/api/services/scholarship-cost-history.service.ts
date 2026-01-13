import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { ScholarshipCostHistory } from '@src/entity/ScholarshipCostHistory'
import { Scholarship } from '@src/entity/Scholarship'
import { Disbursement } from '@src/entity/Disbursement'
import { NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateCostPayload {
  SCHOLARSHIP_ID: number
  PERIOD_TYPE: string
  PERIOD_LABEL: string
  PERIOD_START: string | Date
  PERIOD_END: string | Date
  AMOUNT: number
  STATUS?: string
  NOTES?: string | null
  STATE?: string
}

interface UpdateCostPayload extends Partial<CreateCostPayload> {
  COST_ID: number
}

export class ScholarshipCostHistoryService extends BaseService {
  private costRepository: Repository<ScholarshipCostHistory>
  private scholarshipRepository: Repository<Scholarship>
  private disbursementRepository: Repository<Disbursement>

  constructor() {
    super()
    this.costRepository = this.dataSource.getRepository(ScholarshipCostHistory)
    this.scholarshipRepository = this.dataSource.getRepository(Scholarship)
    this.disbursementRepository = this.dataSource.getRepository(Disbursement)
  }

  @CatchServiceError()
  async create(
    payload: CreateCostPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const scholarship = await this.ensureScholarship(payload.SCHOLARSHIP_ID)

    const cost = this.costRepository.create({
      ...payload,
      PERIOD_START: new Date(payload.PERIOD_START),
      PERIOD_END: new Date(payload.PERIOD_END),
      STATUS: payload.STATUS ?? 'P',
      STATE: payload.STATE ?? 'A',
      CREATED_BY: session.userId,
    })

    await this.costRepository.save(cost)

    await this.ensureDisbursementForCost(cost, scholarship)

    return this.success({
      message: 'Costo de periodo registrado correctamente.',
      data: cost,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateCostPayload): Promise<ApiResponse> {
    const { COST_ID, ...rest } = payload

    const existing = await this.costRepository.findOne({
      where: { COST_ID },
    })

    if (!existing) {
      throw new NotFoundError(
        `El costo con id '${COST_ID}' no existe.`
      )
    }

    const scholarship = rest.SCHOLARSHIP_ID
      ? await this.ensureScholarship(rest.SCHOLARSHIP_ID)
      : await this.ensureScholarship(existing.SCHOLARSHIP_ID)

    await this.costRepository.update(
      { COST_ID },
      {
        ...rest,
        PERIOD_START: rest.PERIOD_START
          ? new Date(rest.PERIOD_START)
          : existing.PERIOD_START,
        PERIOD_END: rest.PERIOD_END
          ? new Date(rest.PERIOD_END)
          : existing.PERIOD_END,
      }
    )

    const merged = {
      ...existing,
      ...rest,
      PERIOD_START: rest.PERIOD_START
        ? new Date(rest.PERIOD_START)
        : existing.PERIOD_START,
      PERIOD_END: rest.PERIOD_END
        ? new Date(rest.PERIOD_END)
        : existing.PERIOD_END,
    } as ScholarshipCostHistory

    await this.syncDisbursementForCost(merged, scholarship)

    return this.success({ message: 'Costo actualizado correctamente.' })
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
          c."COST_ID",
          c."SCHOLARSHIP_ID",
          c."PERIOD_TYPE",
          c."PERIOD_LABEL",
          c."PERIOD_START",
          c."PERIOD_END",
          c."AMOUNT",
          c."STATUS",
          c."NOTES",
          c."STATE",
          c."CREATED_AT",
          s."NAME" AS "SCHOLARSHIP_NAME",
          p."NAME" AS "STUDENT_NAME",
          p."LAST_NAME" AS "STUDENT_LAST_NAME",
          p."IDENTITY_DOCUMENT",
          (
            c."PERIOD_LABEL" || ' ' ||
            s."NAME" || ' ' ||
            p."NAME" || ' ' ||
            p."LAST_NAME"
          ) AS "FILTER"
        FROM PUBLIC."SCHOLARSHIP_COST_HISTORY" c
        INNER JOIN PUBLIC."SCHOLARSHIP" s
          ON s."SCHOLARSHIP_ID" = c."SCHOLARSHIP_ID"
        INNER JOIN PUBLIC."STUDENT" st ON st."STUDENT_ID" = s."STUDENT_ID"
        INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = st."PERSON_ID"
      ) AS cost_subquery
      ${whereClause}
      ORDER BY "COST_ID" DESC
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

  @CatchServiceError()
  async get_cost(costId: number): Promise<ApiResponse> {
    const cost = await this.costRepository.findOne({
      where: { COST_ID: costId },
    })

    if (!cost) {
      throw new NotFoundError(`El costo con id '${costId}' no existe.`)
    }

    return this.success({ data: cost })
  }

  private async ensureScholarship(scholarshipId: number) {
    const scholarship = await this.scholarshipRepository.findOne({
      where: { SCHOLARSHIP_ID: scholarshipId },
    })

    if (!scholarship) {
      throw new NotFoundError(
        `La beca con id '${scholarshipId}' no existe.`
      )
    }

    return scholarship
  }

  private async ensureDisbursementForCost(
    cost: ScholarshipCostHistory,
    scholarship: Scholarship
  ) {
    if (scholarship.STATUS !== 'A') {
      return
    }

    const existing = await this.disbursementRepository.findOne({
      where: { COST_ID: cost.COST_ID },
    })

    if (existing) {
      return
    }

    const disbursement = this.disbursementRepository.create({
      SCHOLARSHIP_ID: cost.SCHOLARSHIP_ID,
      COST_ID: cost.COST_ID,
      AMOUNT: cost.AMOUNT,
      DISBURSEMENT_DATE: cost.PERIOD_END,
      STATUS: 'P',
      STATE: 'A',
    })

    await this.disbursementRepository.save(disbursement)
  }

  private async syncDisbursementForCost(
    cost: ScholarshipCostHistory,
    scholarship: Scholarship
  ) {
    const disbursement = await this.disbursementRepository.findOne({
      where: { COST_ID: cost.COST_ID },
    })

    if (!disbursement) {
      await this.ensureDisbursementForCost(cost, scholarship)
      return
    }

    if (disbursement.STATUS !== 'P') {
      return
    }

    await this.disbursementRepository.update(
      { DISBURSEMENT_ID: disbursement.DISBURSEMENT_ID },
      {
        AMOUNT: cost.AMOUNT,
        DISBURSEMENT_DATE: cost.PERIOD_END,
      }
    )
  }
}
