import { Repository } from 'typeorm'
import { BaseService, CatchServiceError } from './base.service'
import { NotificationService } from './notification.service'
import { ContactType } from '@src/entity/Contact'
import { Notification } from '@src/entity/Notification'
import { NotificationChannel } from '@src/entity/NotificationTemplate'
import { queryRunner } from '@src/helpers/query-utils'
import { ApiResponse } from '@src/types/api.types'

interface AppointmentReminderCandidate {
  APPOINTMENT_ID: number
  TITLE: string
  START_AT: string
  LOCATION?: string | null
  NAME?: string | null
  LAST_NAME?: string | null
  EMAIL?: string | null
}

interface SponsorGratitudeCandidate {
  SPONSOR_ID: number
  SPONSOR_NAME: string
  NAME?: string | null
  LAST_NAME?: string | null
  EMAIL?: string | null
  ACTIVE_PLEDGES: number
  TOTAL_AMOUNT: string
}

type OperationalAutomationSummary = {
  appointmentRemindersQueued: number
  sponsorThankYouQueued: number
}

export class OperationalAutomationService extends BaseService {
  private notificationService: NotificationService
  private notificationRepository: Repository<Notification>

  constructor() {
    super()
    this.notificationService = new NotificationService()
    this.notificationRepository = this.dataSource.getRepository(Notification)
  }

  @CatchServiceError()
  async run(referenceDate = new Date()): Promise<ApiResponse<OperationalAutomationSummary>> {
    const appointmentRemindersQueued =
      await this.queueAppointmentReminders(referenceDate)
    const sponsorThankYouQueued =
      await this.queueSponsorGratitudeReminders(referenceDate)

    return this.success({
      message: 'Automatizaciones operativas ejecutadas.',
      data: {
        appointmentRemindersQueued,
        sponsorThankYouQueued,
      },
    })
  }

  private async queueAppointmentReminders(referenceDate: Date): Promise<number> {
    const endDate = new Date(referenceDate.getTime() + 24 * 60 * 60 * 1000)

    const candidates = await queryRunner<AppointmentReminderCandidate>(
      `
        SELECT
          a."APPOINTMENT_ID",
          a."TITLE",
          a."START_AT",
          a."LOCATION",
          p."NAME",
          p."LAST_NAME",
          email."VALUE" AS "EMAIL"
        FROM PUBLIC."APPOINTMENT" a
        INNER JOIN PUBLIC."PERSON" p
          ON p."PERSON_ID" = a."PERSON_ID"
        LEFT JOIN PUBLIC."CONTACT" email
          ON email."PERSON_ID" = p."PERSON_ID"
          AND email."TYPE" = $3
          AND email."IS_PRIMARY" = TRUE
        WHERE a."STATE" = 'A'
          AND a."STATUS" = 'scheduled'
          AND a."START_AT" > $1
          AND a."START_AT" <= $2
      `,
      [referenceDate, endDate, ContactType.EMAIL]
    )

    let queued = 0

    for (const candidate of candidates) {
      if (!candidate.EMAIL) continue

      const reminderKey = `${candidate.APPOINTMENT_ID}:${candidate.START_AT}`
      const exists = await this.notificationRepository.findOne({
        where: {
          RELATED_ENTITY: 'APPOINTMENT_REMINDER',
          RELATED_ID: reminderKey,
          STATE: 'A',
        },
      })

      if (exists) continue

      const startAt = new Date(candidate.START_AT)
      const fullName =
        `${candidate.NAME || ''} ${candidate.LAST_NAME || ''}`.trim() ||
        'beneficiario'

      await this.notificationService.createFromTemplateKey({
        templateKey: 'REMINDER_APPOINTMENT',
        recipient: candidate.EMAIL,
        payload: {
          name: fullName,
          title: candidate.TITLE,
          date: this.formatDate(startAt),
          time: this.formatTime(startAt),
          location: candidate.LOCATION || 'por confirmar',
        },
        channel: NotificationChannel.EMAIL,
        relatedEntity: 'APPOINTMENT_REMINDER',
        relatedId: reminderKey,
      })

      queued += 1
    }

    return queued
  }

  private async queueSponsorGratitudeReminders(
    referenceDate: Date
  ): Promise<number> {
    const dayOfMonth = referenceDate.getDate()
    if (dayOfMonth < 1 || dayOfMonth > 20) {
      return 0
    }

    const monthKey = this.getMonthKey(referenceDate)
    const monthLabel = this.getMonthLabel(referenceDate)
    const year = String(referenceDate.getFullYear())

    const candidates = await queryRunner<SponsorGratitudeCandidate>(
      `
        SELECT
          s."SPONSOR_ID",
          s."NAME" AS "SPONSOR_NAME",
          p."NAME",
          p."LAST_NAME",
          email."VALUE" AS "EMAIL",
          COUNT(pl."PLEDGE_ID")::INTEGER AS "ACTIVE_PLEDGES",
          COALESCE(SUM(pl."AMOUNT"), 0)::text AS "TOTAL_AMOUNT"
        FROM PUBLIC."SPONSOR" s
        LEFT JOIN PUBLIC."PERSON" p
          ON p."PERSON_ID" = s."PERSON_ID"
        LEFT JOIN PUBLIC."CONTACT" email
          ON email."PERSON_ID" = p."PERSON_ID"
          AND email."TYPE" = $2
          AND email."IS_PRIMARY" = TRUE
        INNER JOIN PUBLIC."PLEDGE" pl
          ON pl."SPONSOR_ID" = s."SPONSOR_ID"
          AND pl."STATE" = 'A'
          AND pl."START_DATE" <= $1::date
          AND (pl."END_DATE" IS NULL OR pl."END_DATE" >= $1::date)
        WHERE s."STATE" = 'A'
        GROUP BY
          s."SPONSOR_ID",
          s."NAME",
          p."NAME",
          p."LAST_NAME",
          email."VALUE"
      `,
      [referenceDate, ContactType.EMAIL]
    )

    let queued = 0

    for (const candidate of candidates) {
      if (!candidate.EMAIL) continue

      const reminderKey = `${candidate.SPONSOR_ID}:${monthKey}`
      const exists = await this.notificationRepository.findOne({
        where: {
          RELATED_ENTITY: 'SPONSOR_GRATITUDE_REMINDER',
          RELATED_ID: reminderKey,
          STATE: 'A',
        },
      })

      if (exists) continue

      const contactName =
        `${candidate.NAME || ''} ${candidate.LAST_NAME || ''}`.trim() ||
        candidate.SPONSOR_NAME

      await this.notificationService.createFromTemplateKey({
        templateKey: 'SPONSOR_GRATITUDE_REMINDER',
        recipient: candidate.EMAIL,
        payload: {
          name: contactName,
          sponsor_name: candidate.SPONSOR_NAME,
          month_label: monthLabel,
          year,
          active_pledges: candidate.ACTIVE_PLEDGES,
          total_amount: this.formatCurrency(candidate.TOTAL_AMOUNT),
        },
        channel: NotificationChannel.EMAIL,
        relatedEntity: 'SPONSOR_GRATITUDE_REMINDER',
        relatedId: reminderKey,
      })

      queued += 1
    }

    return queued
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-DO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('es-DO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }

  private formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2,
    }).format(Number(value) || 0)
  }

  private getMonthLabel(date: Date): string {
    const raw = new Intl.DateTimeFormat('es-DO', {
      month: 'long',
    }).format(date)

    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }

  private getMonthKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${date.getFullYear()}-${month}`
  }
}
