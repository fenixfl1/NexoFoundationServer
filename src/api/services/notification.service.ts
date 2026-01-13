import { Repository } from 'typeorm'
import { BaseService, CatchServiceError } from './base.service'
import { Notification, NotificationStatus } from '@src/entity/Notification'
import {
  NotificationChannel,
  NotificationTemplate,
} from '@src/entity/NotificationTemplate'
import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { NotFoundError, BadRequestError } from '@src/errors/http.error'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'
import EmailService from './email/email.service'
import handlebars from 'handlebars'

interface NotificationPayload {
  TEMPLATE_ID?: number | null
  CHANNEL?: NotificationChannel
  RECIPIENT: string
  SUBJECT?: string | null
  BODY?: string
  PAYLOAD?: Record<string, unknown> | null
  RELATED_ENTITY?: string | null
  RELATED_ID?: string | null
  SCHEDULED_AT?: string | Date | null
  STATUS?: NotificationStatus
  ERROR_MESSAGE?: string | null
}

interface UpdateNotificationPayload extends Partial<NotificationPayload> {
  NOTIFICATION_ID: number
}

export class NotificationService extends BaseService {
  private notificationRepository: Repository<Notification>
  private templateRepository: Repository<NotificationTemplate>
  private emailService: EmailService

  constructor() {
    super()
    this.notificationRepository =
      this.dataSource.getRepository(Notification)
    this.templateRepository = this.dataSource.getRepository(
      NotificationTemplate
    )
    this.emailService = new EmailService()
  }

  @CatchServiceError()
  async create(
    payload: NotificationPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const template = await this.getTemplate(payload.TEMPLATE_ID)

    const channel = payload.CHANNEL ?? template?.CHANNEL
    const subject = payload.SUBJECT ?? template?.SUBJECT ?? null
    const body = payload.BODY ?? template?.BODY

    if (!channel) {
      throw new BadRequestError(
        'El canal de notificación es obligatorio.'
      )
    }

    if (!body) {
      throw new BadRequestError(
        'El cuerpo del mensaje es obligatorio.'
      )
    }

    const notification = this.notificationRepository.create({
      ...payload,
      CHANNEL: channel,
      SUBJECT: subject,
      BODY: body,
      TEMPLATE_ID: template?.TEMPLATE_ID ?? null,
      PAYLOAD: payload.PAYLOAD ?? null,
      RELATED_ENTITY: payload.RELATED_ENTITY ?? null,
      RELATED_ID: payload.RELATED_ID ?? null,
      SCHEDULED_AT: payload.SCHEDULED_AT
        ? new Date(payload.SCHEDULED_AT)
        : null,
      STATUS: payload.STATUS ?? NotificationStatus.PENDING,
      ERROR_MESSAGE: payload.ERROR_MESSAGE ?? null,
      CREATED_BY: session?.userId,
    })

    await this.notificationRepository.save(notification)

    return this.success({
      message: 'Notificación registrada correctamente.',
      data: notification,
    })
  }

  @CatchServiceError()
  async dispatchPending(limit = 25): Promise<ApiResponse> {
    const notifications = await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.TEMPLATE', 'template')
      .where('notification.STATUS IN (:...statuses)', {
        statuses: [
          NotificationStatus.PENDING,
          NotificationStatus.SCHEDULED,
        ],
      })
      .andWhere(
        '(notification."SCHEDULED_AT" IS NULL OR notification."SCHEDULED_AT" <= NOW())'
      )
      .orderBy('notification."CREATED_AT"', 'ASC')
      .limit(limit)
      .getMany()

    if (!notifications.length) {
      return this.success({ message: 'No hay notificaciones pendientes.' })
    }

    for (const notification of notifications) {
      try {
        await this.sendNotification(notification)
        await this.notificationRepository.update(
          { NOTIFICATION_ID: notification.NOTIFICATION_ID },
          {
            STATUS: NotificationStatus.SENT,
            SENT_AT: new Date(),
            ERROR_MESSAGE: null,
          }
        )
      } catch (error) {
        await this.notificationRepository.update(
          { NOTIFICATION_ID: notification.NOTIFICATION_ID },
          {
            STATUS: NotificationStatus.FAILED,
            ERROR_MESSAGE: error.message ?? 'Error enviando notificación.',
          }
        )
      }
    }

    return this.success({
      message: `Procesadas ${notifications.length} notificaciones.`,
    })
  }

  @CatchServiceError()
  async createFromTemplateKey({
    templateKey,
    recipient,
    payload,
    channel,
    relatedEntity,
    relatedId,
  }: {
    templateKey: string
    recipient: string
    payload?: Record<string, unknown> | null
    channel?: NotificationChannel
    relatedEntity?: string
    relatedId?: string | number
  }): Promise<void> {
    const template = await this.templateRepository.findOne({
      where: { TEMPLATE_KEY: templateKey },
    })

    if (!template) {
      throw new NotFoundError(
        `La plantilla con clave '${templateKey}' no fue encontrada.`
      )
    }

    await this.notificationRepository.save({
      TEMPLATE_ID: template.TEMPLATE_ID,
      CHANNEL: channel ?? template.CHANNEL,
      RECIPIENT: recipient,
      SUBJECT: template.SUBJECT,
      BODY: template.BODY,
      PAYLOAD: payload ?? null,
      RELATED_ENTITY: relatedEntity ?? null,
      RELATED_ID: relatedId ? String(relatedId) : null,
      STATUS: NotificationStatus.PENDING,
    })
  }

  @CatchServiceError()
  async update(
    payload: UpdateNotificationPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const { NOTIFICATION_ID, TEMPLATE_ID, STATUS, ...rest } = payload

    const existing = await this.notificationRepository.findOne({
      where: { NOTIFICATION_ID },
    })

    if (!existing) {
      throw new NotFoundError(
        `La notificación con id '${NOTIFICATION_ID}' no fue encontrada.`
      )
    }

    const template = await this.getTemplate(TEMPLATE_ID ?? existing.TEMPLATE_ID)

    const nextChannel = rest.CHANNEL ?? template?.CHANNEL ?? existing.CHANNEL
    const nextSubject =
      rest.SUBJECT ?? template?.SUBJECT ?? existing.SUBJECT ?? null
    const nextBody = rest.BODY ?? template?.BODY ?? existing.BODY

    if (!nextChannel) {
      throw new BadRequestError('El canal de notificación es obligatorio.')
    }

    if (!nextBody) {
      throw new BadRequestError('El cuerpo del mensaje es obligatorio.')
    }

    const nextStatus = STATUS ?? existing.STATUS

    const updatePayload: Partial<Notification> = {
      ...rest,
      CHANNEL: nextChannel,
      SUBJECT: nextSubject,
      BODY: nextBody,
      TEMPLATE_ID: template?.TEMPLATE_ID ?? null,
      STATUS: nextStatus,
      PAYLOAD:
        rest.PAYLOAD !== undefined ? rest.PAYLOAD : existing.PAYLOAD,
      RELATED_ENTITY:
        rest.RELATED_ENTITY !== undefined
          ? rest.RELATED_ENTITY
          : existing.RELATED_ENTITY,
      RELATED_ID:
        rest.RELATED_ID !== undefined
          ? rest.RELATED_ID
          : existing.RELATED_ID,
      SCHEDULED_AT:
        rest.SCHEDULED_AT !== undefined
          ? rest.SCHEDULED_AT
            ? new Date(rest.SCHEDULED_AT)
            : null
          : existing.SCHEDULED_AT,
      ERROR_MESSAGE:
        rest.ERROR_MESSAGE !== undefined
          ? rest.ERROR_MESSAGE
          : existing.ERROR_MESSAGE,
    }

    if (
      nextStatus === NotificationStatus.SENT &&
      !updatePayload.SENT_AT
    ) {
      updatePayload.SENT_AT = new Date()
    }

    if (
      nextStatus === NotificationStatus.SENT &&
      session?.userId &&
      !updatePayload.SENT_BY
    ) {
      updatePayload.SENT_BY = session.userId
    }

    await this.notificationRepository.update(
      { NOTIFICATION_ID },
      updatePayload
    )

    return this.success({ message: 'Notificación actualizada correctamente.' })
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
          n."NOTIFICATION_ID",
          n."TEMPLATE_ID",
          n."CHANNEL",
          n."RECIPIENT",
          n."SUBJECT",
          n."BODY",
          n."PAYLOAD",
          n."STATUS",
          n."RELATED_ENTITY",
          n."RELATED_ID",
          n."SCHEDULED_AT",
          n."SENT_AT",
          n."SENT_BY",
          n."ERROR_MESSAGE",
          n."STATE",
          n."CREATED_AT",
          nt."TEMPLATE_KEY",
          nt."NAME" AS "TEMPLATE_NAME"
        FROM PUBLIC."NOTIFICATION" n
        LEFT JOIN PUBLIC."NOTIFICATION_TEMPLATE" nt
          ON nt."TEMPLATE_ID" = n."TEMPLATE_ID"
      ) AS notifications_subquery
      ${whereClause}
      ORDER BY "NOTIFICATION_ID" DESC
    `

    const [data = [], metadata] = await paginatedQuery({
      statement,
      values,
      pagination,
    })

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

    const summary = Object.values(NotificationStatus).reduce<
      Record<string, number>
    >((acc, status) => {
      acc[status] = 0
      return acc
    }, {})

    summaryRows.forEach(({ STATUS, COUNT }) => {
      summary[STATUS] = COUNT
    })

    const metadataWithSummary = { ...metadata, summary }

    if (!data.length) {
      return this.success({
        status: HTTP_STATUS_NO_CONTENT,
        metadata: metadataWithSummary,
      })
    }

    return this.success({ data, metadata: metadataWithSummary })
  }

  @CatchServiceError()
  async get_notification(notificationId: number): Promise<ApiResponse> {
    const statement = `
      SELECT
        n.*,
        nt."TEMPLATE_KEY",
        nt."NAME" AS "TEMPLATE_NAME"
      FROM PUBLIC."NOTIFICATION" n
      LEFT JOIN PUBLIC."NOTIFICATION_TEMPLATE" nt
        ON nt."TEMPLATE_ID" = n."TEMPLATE_ID"
      WHERE n."NOTIFICATION_ID" = $1
    `

    const [notification] = await queryRunner(statement, [notificationId])

    if (!notification) {
      throw new NotFoundError(
        `La notificación con id '${notificationId}' no fue encontrada.`
      )
    }

    return this.success({ data: notification })
  }

  private async getTemplate(templateId?: number | null) {
    if (!templateId) {
      return null
    }

    const template = await this.templateRepository.findOne({
      where: { TEMPLATE_ID: templateId },
    })

    if (!template) {
      throw new NotFoundError(
        `La plantilla con identificador '${templateId}' no fue encontrada.`
      )
    }

    return template
  }

  private async sendNotification(notification: Notification) {
    if (notification.CHANNEL !== NotificationChannel.EMAIL) {
      throw new BadRequestError(
        `El canal '${notification.CHANNEL}' aún no está soportado.`
      )
    }

    const templateDefaults =
      (notification.TEMPLATE?.DEFAULTS as Record<string, unknown>) ?? {}
    const payload = notification.PAYLOAD ?? {}
    const context = {
      ...templateDefaults,
      ...payload,
    }

    const render = (content?: string | null) => {
      if (!content) return ''
      const compiled = handlebars.compile(content)
      return compiled(context)
    }

    const subject = render(notification.SUBJECT) || 'Notificación'
    const body = render(notification.BODY) || notification.BODY

    await this.emailService.send({
      to: notification.RECIPIENT,
      subject,
      text: body,
      templateName: 'notification-generic',
      record: {
        title: subject,
        content: body,
      },
    })
  }
}
