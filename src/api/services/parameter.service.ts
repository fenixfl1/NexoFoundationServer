import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { Parameter } from '@src/entity/Parameter'
import { MenuOption } from '@src/entity/MenuOption'
import { DbConflictError, NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateParameterPayload {
  PARAMETER: string
  DESCRIPTION?: string | null
  VALUE?: string | null
  MENU_OPTION_ID: string
  STATE?: string
}

interface UpdateParameterPayload extends CreateParameterPayload {
  PARAMETER_ID: number
}

export class ParameterService extends BaseService {
  private parameterRepository: Repository<Parameter>
  private menuOptionRepository: Repository<MenuOption>

  constructor() {
    super()
    this.parameterRepository = this.dataSource.getRepository(Parameter)
    this.menuOptionRepository = this.dataSource.getRepository(MenuOption)
  }

  @CatchServiceError()
  async create(
    payload: CreateParameterPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const { MENU_OPTION_ID, PARAMETER } = payload

    await this.ensureMenuOptionExists(MENU_OPTION_ID)
    await this.ensureUnique(MENU_OPTION_ID, PARAMETER)

    const parameter = this.parameterRepository.create({
      ...payload,
      STATE: payload.STATE ?? 'A',
      CREATED_BY: session?.userId,
    })

    await this.parameterRepository.save(parameter)

    return this.success({ message: 'Parámetro creado correctamente.' })
  }

  @CatchServiceError()
  async update(payload: UpdateParameterPayload): Promise<ApiResponse> {
    const { PARAMETER_ID, MENU_OPTION_ID, PARAMETER, ...rest } = payload

    const existing = await this.parameterRepository.findOne({
      where: { PARAMETER_ID },
    })

    if (!existing) {
      throw new NotFoundError(
        `El parámetro con id '${PARAMETER_ID}' no fue encontrado.`
      )
    }

    if (MENU_OPTION_ID) {
      await this.ensureMenuOptionExists(MENU_OPTION_ID)
    }

    const targetMenuOptionId = MENU_OPTION_ID ?? existing.MENU_OPTION_ID
    const targetParameter = PARAMETER ?? existing.PARAMETER

    await this.ensureUnique(targetMenuOptionId, targetParameter, PARAMETER_ID)

    await this.parameterRepository.update(
      { PARAMETER_ID },
      {
        ...rest,
        MENU_OPTION_ID: targetMenuOptionId,
        PARAMETER: targetParameter,
      }
    )

    return this.success({ message: 'Parámetro actualizado correctamente.' })
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
      FROM
        (
          SELECT
            P."PARAMETER_ID",
            P."PARAMETER",
            P."DESCRIPTION",
            P."VALUE",
            P."MENU_OPTION_ID",
            P."CREATED_AT",
            P."CREATED_BY",
            p."STATE",
            MO."NAME" AS "MENU_OPTION_NAME"
          FROM
            PUBLIC."PARAMETER" P
            LEFT JOIN PUBLIC."MENU_OPTION" MO ON MO."MENU_OPTION_ID" = P."MENU_OPTION_ID"
        )
      ${whereClause}
      ORDER BY
        "PARAMETER_ID"
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
        summary_subquery."STATE",
        COUNT(*)::INTEGER AS "COUNT"
      FROM (${statement}) AS summary_subquery
      GROUP BY summary_subquery."STATE"
    `

    const summaryData = await this.dataSource.query(summaryStatement, values)

    const summary = summaryData.reduce((acc, { STATE, COUNT }) => {
      acc[STATE] = COUNT
      return acc
    }, {})

    return this.success({ data, metadata: { ...metadata, summary } })
  }

  @CatchServiceError()
  async getActivityParameter(activityId: string) {
    const parameters = await this.parameterRepository.find({
      select: ['PARAMETER', 'VALUE'],
      where: {
        MENU_OPTION_ID: activityId,
        STATE: 'A',
      },
    })

    if (!parameters.length) {
      return this.noContent()
    }

    const data = parameters.reduce((acc, curr) => {
      acc[curr.PARAMETER] = curr.VALUE
      return acc
    }, <Record<string, string>>{})

    return this.success({ data })
  }

  private async ensureMenuOptionExists(menuOptionId: string): Promise<void> {
    const exists = await this.menuOptionRepository.findOne({
      where: { MENU_OPTION_ID: menuOptionId },
    })

    if (!exists) {
      throw new NotFoundError(
        `La opción de menú '${menuOptionId}' no fue encontrada.`
      )
    }
  }

  private async ensureUnique(
    menuOptionId: string,
    parameter: string,
    excludeId?: number
  ): Promise<void> {
    const existing = await this.parameterRepository.findOne({
      where: {
        MENU_OPTION_ID: menuOptionId,
        PARAMETER: parameter,
      },
    })

    if (existing && existing.PARAMETER_ID !== excludeId) {
      throw new DbConflictError(
        `El parámetro '${parameter}' ya existe para la opción de menú '${menuOptionId}'.`
      )
    }
  }
}
