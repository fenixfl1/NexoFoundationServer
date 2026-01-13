import { Repository } from 'typeorm'
import { BaseService, CatchServiceError } from './base.service'
import { NotificationTemplate } from '@src/entity/NotificationTemplate'
import { MenuOption } from '@src/entity/MenuOption'
import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { DbConflictError, NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface TemplatePayload {
  TEMPLATE_KEY: string
  NAME: string
  DESCRIPTION?: string | null
  CHANNEL: NotificationTemplate['CHANNEL']
  SUBJECT?: string | null
  BODY: string
  PARAMETERS?: Record<string, unknown> | null
  DEFAULTS?: Record<string, unknown> | null
  MENU_OPTION_ID?: string | null
  STATE?: string
}

interface UpdateTemplatePayload extends Partial<TemplatePayload> {
  TEMPLATE_ID: number
}

export class NotificationTemplateService extends BaseService {
  private templateRepository: Repository<NotificationTemplate>
  private menuOptionRepository: Repository<MenuOption>

  constructor() {
    super()
    this.templateRepository = this.dataSource.getRepository(
      NotificationTemplate
    )
    this.menuOptionRepository = this.dataSource.getRepository(MenuOption)
  }

  @CatchServiceError()
  async create(
    payload: TemplatePayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const { MENU_OPTION_ID, TEMPLATE_KEY } = payload

    if (MENU_OPTION_ID) {
      await this.ensureMenuOptionExists(MENU_OPTION_ID)
    }

    await this.ensureUniqueKey(TEMPLATE_KEY)

    const template = this.templateRepository.create({
      ...payload,
      MENU_OPTION_ID: MENU_OPTION_ID ?? null,
      PARAMETERS: payload.PARAMETERS ?? null,
      DEFAULTS: payload.DEFAULTS ?? null,
      STATE: payload.STATE ?? 'A',
      CREATED_BY: session?.userId,
    })

    await this.templateRepository.save(template)

    return this.success({
      message: 'Plantilla registrada correctamente.',
      data: template,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateTemplatePayload): Promise<ApiResponse> {
    const { TEMPLATE_ID, TEMPLATE_KEY, MENU_OPTION_ID, ...rest } = payload

    const existing = await this.templateRepository.findOne({
      where: { TEMPLATE_ID },
    })

    if (!existing) {
      throw new NotFoundError(
        `La plantilla con identificador '${TEMPLATE_ID}' no fue encontrada.`
      )
    }

    if (MENU_OPTION_ID) {
      await this.ensureMenuOptionExists(MENU_OPTION_ID)
    }

    if (TEMPLATE_KEY && TEMPLATE_KEY !== existing.TEMPLATE_KEY) {
      await this.ensureUniqueKey(TEMPLATE_KEY, TEMPLATE_ID)
    }

    await this.templateRepository.update(
      { TEMPLATE_ID },
      {
        ...rest,
        TEMPLATE_KEY: TEMPLATE_KEY ?? existing.TEMPLATE_KEY,
        MENU_OPTION_ID: MENU_OPTION_ID ?? existing.MENU_OPTION_ID,
      }
    )

    return this.success({
      message: 'Plantilla actualizada correctamente.',
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
          nt."TEMPLATE_ID",
          nt."TEMPLATE_KEY",
          nt."NAME",
          nt."DESCRIPTION",
          nt."CHANNEL",
          nt."SUBJECT",
          nt."BODY",
          nt."PARAMETERS",
          nt."DEFAULTS",
          nt."MENU_OPTION_ID",
          nt."STATE",
          nt."CREATED_AT",
          mo."NAME" AS "MENU_OPTION_NAME"
        FROM PUBLIC."NOTIFICATION_TEMPLATE" nt
        LEFT JOIN PUBLIC."MENU_OPTION" mo
          ON mo."MENU_OPTION_ID" = nt."MENU_OPTION_ID"
      ) AS template_subquery
      ${whereClause}
      ORDER BY "TEMPLATE_ID"
    `

    const [data = [], metadata] = await paginatedQuery({
      statement,
      values,
      pagination,
    })

    if (!data.length) {
      return this.success({ status: HTTP_STATUS_NO_CONTENT, metadata })
    }

    return this.success({ data, metadata })
  }

  @CatchServiceError()
  async get_template(templateId: number): Promise<ApiResponse> {
    const template = await this.templateRepository.findOne({
      where: { TEMPLATE_ID: templateId },
    })

    if (!template) {
      throw new NotFoundError(
        `La plantilla con identificador '${templateId}' no fue encontrada.`
      )
    }

    return this.success({ data: template })
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

  private async ensureUniqueKey(
    templateKey: string,
    templateId?: number
  ): Promise<void> {
    const exists = await this.templateRepository.findOne({
      where: { TEMPLATE_KEY: templateKey },
    })

    if (exists && exists.TEMPLATE_ID !== templateId) {
      throw new DbConflictError(
        `La plantilla con clave '${templateKey}' ya existe.`
      )
    }
  }
}
