import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { Pledge } from '@src/entity/Pledge'
import { Sponsor } from '@src/entity/Sponsor'
import { NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreatePledgePayload {
  SPONSOR_ID: number
  NAME: string
  DESCRIPTION?: string | null
  AMOUNT: number
  START_DATE: string | Date
  END_DATE?: string | Date | null
  FREQUENCY?: string | null
  STATUS?: string
  NOTES?: string | null
  STATE?: string
}

interface UpdatePledgePayload extends Partial<CreatePledgePayload> {
  PLEDGE_ID: number
}

export class PledgeService extends BaseService {
  private pledgeRepository: Repository<Pledge>
  private sponsorRepository: Repository<Sponsor>

  constructor() {
    super()
    this.pledgeRepository = this.dataSource.getRepository(Pledge)
    this.sponsorRepository = this.dataSource.getRepository(Sponsor)
  }

  @CatchServiceError()
  async create(
    payload: CreatePledgePayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    await this.ensureSponsor(payload.SPONSOR_ID)

    const pledge = this.pledgeRepository.create({
      ...payload,
      START_DATE: new Date(payload.START_DATE),
      END_DATE: payload.END_DATE ? new Date(payload.END_DATE) : null,
      STATUS: payload.STATUS ?? 'P',
      STATE: payload.STATE ?? 'A',
      CREATED_BY: session.userId,
    })

    await this.pledgeRepository.save(pledge)

    return this.success({
      message: 'Compromiso registrado correctamente.',
      data: pledge,
    })
  }

  @CatchServiceError()
  async update(payload: UpdatePledgePayload): Promise<ApiResponse> {
    const { PLEDGE_ID, ...rest } = payload

    const pledge = await this.pledgeRepository.findOne({
      where: { PLEDGE_ID },
    })

    if (!pledge) {
      throw new NotFoundError(
        `El compromiso con id '${PLEDGE_ID}' no existe.`
      )
    }

    if (rest.SPONSOR_ID) {
      await this.ensureSponsor(rest.SPONSOR_ID)
    }

    await this.pledgeRepository.update(
      { PLEDGE_ID },
      {
        ...rest,
        START_DATE: rest.START_DATE
          ? new Date(rest.START_DATE)
          : pledge.START_DATE,
        END_DATE:
          rest.END_DATE !== undefined
            ? rest.END_DATE
              ? new Date(rest.END_DATE)
              : null
            : pledge.END_DATE,
      }
    )

    return this.success({ message: 'Compromiso actualizado correctamente.' })
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
          p."PLEDGE_ID",
          p."SPONSOR_ID",
          p."NAME",
          p."DESCRIPTION",
          p."AMOUNT",
          p."START_DATE",
          p."END_DATE",
          p."FREQUENCY",
          p."STATUS",
          p."NOTES",
          p."STATE",
          p."CREATED_AT",
          s."NAME" AS "SPONSOR_NAME",
          s."TYPE" AS "SPONSOR_TYPE",
          (
            p."NAME" || ' ' ||
            s."NAME" || ' ' ||
            COALESCE(p."DESCRIPTION", '') || ' ' ||
            COALESCE(p."FREQUENCY", '')
          ) AS "FILTER"
        FROM PUBLIC."PLEDGE" p
        INNER JOIN PUBLIC."SPONSOR" s ON s."SPONSOR_ID" = p."SPONSOR_ID"
      ) AS pledge_subquery
      ${whereClause}
      ORDER BY "PLEDGE_ID" DESC
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
  async get_pledge(pledgeId: number): Promise<ApiResponse> {
    const statement = `
      SELECT
        p.*,
        s."NAME" AS "SPONSOR_NAME",
        s."TYPE" AS "SPONSOR_TYPE"
      FROM PUBLIC."PLEDGE" p
      INNER JOIN PUBLIC."SPONSOR" s ON s."SPONSOR_ID" = p."SPONSOR_ID"
      WHERE p."PLEDGE_ID" = $1
    `

    const [pledge] = await queryRunner<Pledge>(statement, [pledgeId])

    if (!pledge) {
      throw new NotFoundError(
        `El compromiso con id '${pledgeId}' no existe.`
      )
    }

    return this.success({ data: pledge })
  }

  private async ensureSponsor(sponsorId: number) {
    const exists = await this.sponsorRepository.findOne({
      where: { SPONSOR_ID: sponsorId },
    })

    if (!exists) {
      throw new NotFoundError(
        `El patrocinador con id '${sponsorId}' no existe.`
      )
    }
  }
}
