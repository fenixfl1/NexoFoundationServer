import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { Appointment, AppointmentStatus } from '@src/entity/Appointment'
import { NotFoundError } from '@src/errors/http.error'
import { Student } from '@src/entity/Student'
import { Request } from '@src/entity/Request'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateAppointmentPayload {
  PERSON_ID: number
  REQUEST_ID?: number | null
  STUDENT_ID?: number | null
  TITLE: string
  DESCRIPTION?: string | null
  START_AT: string | Date
  END_AT?: string | Date | null
  LOCATION?: string | null
  STATUS?: AppointmentStatus
  NOTES?: string | null
}

interface UpdateAppointmentPayload extends Partial<CreateAppointmentPayload> {
  APPOINTMENT_ID: number
}

export class AppointmentService extends BaseService {
  private appointmentRepository: Repository<Appointment>
  private studentRepository: Repository<Student>
  private requestRepository: Repository<Request>

  constructor() {
    super()
    this.appointmentRepository = this.dataSource.getRepository(Appointment)
    this.studentRepository = this.dataSource.getRepository(Student)
    this.requestRepository = this.dataSource.getRepository(Request)
  }

  @CatchServiceError()
  async create(
    payload: CreateAppointmentPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    await this.ensureRelations(payload)

    const appointment = this.appointmentRepository.create({
      ...payload,
      START_AT: new Date(payload.START_AT),
      END_AT: payload.END_AT ? new Date(payload.END_AT) : null,
      STATUS: payload.STATUS ?? AppointmentStatus.SCHEDULED,
      CREATED_BY: session.userId,
    })

    await this.appointmentRepository.save(appointment)

    return this.success({
      message: 'Cita registrada correctamente.',
      data: appointment,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateAppointmentPayload): Promise<ApiResponse> {
    const { APPOINTMENT_ID, ...rest } = payload

    const appointment = await this.appointmentRepository.findOne({
      where: { APPOINTMENT_ID },
    })

    if (!appointment) {
      throw new NotFoundError(
        `La cita con identificador '${APPOINTMENT_ID}' no existe.`
      )
    }

    await this.ensureRelations(rest as CreateAppointmentPayload)

    await this.appointmentRepository.update(
      { APPOINTMENT_ID },
      {
        ...rest,
        START_AT: rest.START_AT
          ? new Date(rest.START_AT)
          : appointment.START_AT,
        END_AT:
          rest.END_AT !== undefined
            ? rest.END_AT
              ? new Date(rest.END_AT)
              : null
            : appointment.END_AT,
      }
    )

    return this.success({ message: 'Cita actualizada correctamente.' })
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
          a."APPOINTMENT_ID",
          a."PERSON_ID",
          a."REQUEST_ID",
          a."STUDENT_ID",
          a."TITLE",
          a."DESCRIPTION",
          a."START_AT",
          a."END_AT",
          a."LOCATION",
          a."STATUS",
          a."NOTES",
          a."STATE",
          p."NAME",
          p."LAST_NAME",
          p."IDENTITY_DOCUMENT",
          r."REQUEST_TYPE",
          s."UNIVERSITY"
        FROM PUBLIC."APPOINTMENT" a
        INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = a."PERSON_ID"
        LEFT JOIN PUBLIC."REQUEST" r ON r."REQUEST_ID" = a."REQUEST_ID"
        LEFT JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = a."STUDENT_ID"
      ) AS appointment_subquery
      ${whereClause}
      ORDER BY "START_AT" DESC
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
  async get_appointment(appointmentId: number): Promise<ApiResponse> {
    const statement = `
      SELECT
        a.*,
        p."NAME",
        p."LAST_NAME",
        p."IDENTITY_DOCUMENT"
      FROM PUBLIC."APPOINTMENT" a
      INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = a."PERSON_ID"
      WHERE a."APPOINTMENT_ID" = $1
    `

    const [appointment] = await queryRunner<Appointment>(statement, [
      appointmentId,
    ])

    if (!appointment) {
      throw new NotFoundError(
        `La cita con identificador '${appointmentId}' no existe.`
      )
    }

    return this.success({ data: appointment })
  }

  private async ensureRelations(
    payload: Partial<CreateAppointmentPayload>
  ): Promise<void> {
    if (payload.PERSON_ID) {
      await this.getPerson(payload.PERSON_ID)
    }

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
