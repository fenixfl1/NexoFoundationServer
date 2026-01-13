import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { Sponsor } from '@src/entity/Sponsor'
import { NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateSponsorPayload {
  NAME: string
  TYPE?: string | null
  TAX_ID?: string | null
  CONTACT_NAME?: string | null
  CONTACT_EMAIL?: string | null
  CONTACT_PHONE?: string | null
  ADDRESS?: string | null
  NOTES?: string | null
  STATE?: string
}

interface UpdateSponsorPayload extends Partial<CreateSponsorPayload> {
  SPONSOR_ID: number
}

export class SponsorService extends BaseService {
  private sponsorRepository: Repository<Sponsor>

  constructor() {
    super()
    this.sponsorRepository = this.dataSource.getRepository(Sponsor)
  }

  @CatchServiceError()
  async create(
    payload: CreateSponsorPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const sponsor = this.sponsorRepository.create({
      ...payload,
      STATE: payload.STATE ?? 'A',
      CREATED_BY: session.userId,
    })

    await this.sponsorRepository.save(sponsor)

    return this.success({
      message: 'Patrocinador registrado correctamente.',
      data: sponsor,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateSponsorPayload): Promise<ApiResponse> {
    const { SPONSOR_ID, ...rest } = payload

    const sponsor = await this.sponsorRepository.findOne({
      where: { SPONSOR_ID },
    })

    if (!sponsor) {
      throw new NotFoundError(
        `El patrocinador con id '${SPONSOR_ID}' no existe.`
      )
    }

    await this.sponsorRepository.update({ SPONSOR_ID }, { ...rest })

    return this.success({ message: 'Patrocinador actualizado correctamente.' })
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
          s."SPONSOR_ID",
          s."NAME",
          s."TYPE",
          s."TAX_ID",
          s."CONTACT_NAME",
          s."CONTACT_EMAIL",
          s."CONTACT_PHONE",
          s."ADDRESS",
          s."NOTES",
          s."STATE",
          s."CREATED_AT",
          (
            s."NAME" || ' ' ||
            COALESCE(s."TYPE", '') || ' ' ||
            COALESCE(s."TAX_ID", '') || ' ' ||
            COALESCE(s."CONTACT_NAME", '') || ' ' ||
            COALESCE(s."CONTACT_EMAIL", '') || ' ' ||
            COALESCE(s."CONTACT_PHONE", '')
          ) AS "FILTER"
        FROM PUBLIC."SPONSOR" s
      ) AS sponsor_subquery
      ${whereClause}
      ORDER BY "SPONSOR_ID" DESC
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
  async get_sponsor(sponsorId: number): Promise<ApiResponse> {
    const sponsor = await this.sponsorRepository.findOne({
      where: { SPONSOR_ID: sponsorId },
    })

    if (!sponsor) {
      throw new NotFoundError(
        `El patrocinador con id '${sponsorId}' no existe.`
      )
    }

    return this.success({ data: sponsor })
  }
}
