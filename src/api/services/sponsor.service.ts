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
  PERSON_ID: number
  NAME?: string | null
  TYPE?: string | null
  TAX_ID?: string | null
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
    const person = await this.personRepository.findOne({
      where: { PERSON_ID: payload.PERSON_ID },
    })

    if (!person) {
      throw new NotFoundError(
        `La persona con id '${payload.PERSON_ID}' no existe.`
      )
    }

    const sponsorName =
      payload.NAME?.trim() ||
      `${person.NAME} ${person.LAST_NAME}`.trim() ||
      person.IDENTITY_DOCUMENT

    const sponsor = this.sponsorRepository.create({
      ...payload,
      NAME: sponsorName,
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

    if (rest.PERSON_ID) {
      const person = await this.personRepository.findOne({
        where: { PERSON_ID: rest.PERSON_ID },
      })
      if (!person) {
        throw new NotFoundError(
          `La persona con id '${rest.PERSON_ID}' no existe.`
        )
      }
      if (!rest.NAME) {
        rest.NAME = `${person.NAME} ${person.LAST_NAME}`.trim()
      }
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
          s."PERSON_ID",
          s."NAME",
          s."TYPE",
          s."TAX_ID",
          s."STATE",
          s."CREATED_AT",
          p."NAME" AS "PERSON_NAME",
          p."LAST_NAME" AS "PERSON_LAST_NAME",
          p."IDENTITY_DOCUMENT" AS "PERSON_IDENTITY_DOCUMENT",
          (
            COALESCE(p."NAME", '') || ' ' ||
            COALESCE(p."LAST_NAME", '') || ' ' ||
            COALESCE(p."IDENTITY_DOCUMENT", '') || ' ' ||
            COALESCE(s."TYPE", '') || ' ' ||
            COALESCE(s."TAX_ID", '')
          ) AS "FILTER"
        FROM PUBLIC."SPONSOR" s
        LEFT JOIN PUBLIC."PERSON" p
          ON p."PERSON_ID" = s."PERSON_ID"
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
    const sponsor = await this.sponsorRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.PERSON', 'p')
      .where('s."SPONSOR_ID" = :sponsorId', { sponsorId })
      .getOne()

    if (!sponsor) {
      throw new NotFoundError(
        `El patrocinador con id '${sponsorId}' no existe.`
      )
    }

    return this.success({ data: sponsor })
  }
}
