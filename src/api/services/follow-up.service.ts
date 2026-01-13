import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { FollowUp, FollowUpStatus } from '@src/entity/FollowUp'
import { Student } from '@src/entity/Student'
import { Appointment } from '@src/entity/Appointment'
import { NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateFollowUpPayload {
  STUDENT_ID: number
  APPOINTMENT_ID?: number | null
  FOLLOW_UP_DATE: string | Date
  SUMMARY: string
  NOTES?: string | null
  NEXT_APPOINTMENT?: string | Date | null
  STATUS?: FollowUpStatus
}

interface UpdateFollowUpPayload extends Partial<CreateFollowUpPayload> {
  FOLLOW_UP_ID: number
}

export class FollowUpService extends BaseService {
  private followUpRepository: Repository<FollowUp>
  private studentRepository: Repository<Student>
  private appointmentRepository: Repository<Appointment>

  constructor() {
    super()
    this.followUpRepository = this.dataSource.getRepository(FollowUp)
    this.studentRepository = this.dataSource.getRepository(Student)
    this.appointmentRepository = this.dataSource.getRepository(Appointment)
  }

  @CatchServiceError()
  async create(
    payload: CreateFollowUpPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    await this.ensureRelations(payload)

    const followUp = this.followUpRepository.create({
      ...payload,
      FOLLOW_UP_DATE: new Date(payload.FOLLOW_UP_DATE),
      NEXT_APPOINTMENT: payload.NEXT_APPOINTMENT
        ? new Date(payload.NEXT_APPOINTMENT)
        : null,
      STATUS: payload.STATUS ?? FollowUpStatus.OPEN,
      CREATED_BY: session.userId,
    })

    await this.followUpRepository.save(followUp)

    await this.updateStudentTracking(
      payload.STUDENT_ID,
      followUp.FOLLOW_UP_DATE,
      followUp.NEXT_APPOINTMENT
    )

    return this.success({
      message: 'Seguimiento registrado correctamente.',
      data: followUp,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateFollowUpPayload): Promise<ApiResponse> {
    const { FOLLOW_UP_ID, ...rest } = payload

    const followUp = await this.followUpRepository.findOne({
      where: { FOLLOW_UP_ID },
    })

    if (!followUp) {
      throw new NotFoundError(
        `El seguimiento con identificador '${FOLLOW_UP_ID}' no existe.`
      )
    }

    await this.ensureRelations(rest)

    const followUpDate =
      rest.FOLLOW_UP_DATE !== undefined
        ? new Date(rest.FOLLOW_UP_DATE)
        : followUp.FOLLOW_UP_DATE
    const nextAppointment =
      rest.NEXT_APPOINTMENT !== undefined
        ? rest.NEXT_APPOINTMENT
          ? new Date(rest.NEXT_APPOINTMENT)
          : null
        : followUp.NEXT_APPOINTMENT

    await this.followUpRepository.update(
      { FOLLOW_UP_ID },
      {
        ...rest,
        FOLLOW_UP_DATE: followUpDate,
        NEXT_APPOINTMENT: nextAppointment,
      }
    )

    const studentId = rest.STUDENT_ID ?? followUp.STUDENT_ID
    await this.updateStudentTracking(studentId, followUpDate, nextAppointment)

    return this.success({ message: 'Seguimiento actualizado correctamente.' })
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
          f."FOLLOW_UP_ID",
          f."STUDENT_ID",
          f."APPOINTMENT_ID",
          f."FOLLOW_UP_DATE",
          f."SUMMARY",
          f."NOTES",
          f."NEXT_APPOINTMENT",
          f."STATUS",
          f."STATE",
          s."PERSON_ID",
          p."NAME",
          p."LAST_NAME",
          p."IDENTITY_DOCUMENT",
          s."UNIVERSITY",
          s."CAREER"
        FROM PUBLIC."FOLLOW_UP" f
        INNER JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = f."STUDENT_ID"
        INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = s."PERSON_ID"
      ) AS follow_up_subquery
      ${whereClause}
      ORDER BY "FOLLOW_UP_DATE" DESC
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
  async get_follow_up(followUpId: number): Promise<ApiResponse> {
    const statement = `
      SELECT
        f.*,
        s."PERSON_ID",
        p."NAME",
        p."LAST_NAME",
        p."IDENTITY_DOCUMENT",
        s."UNIVERSITY",
        s."CAREER"
      FROM PUBLIC."FOLLOW_UP" f
      INNER JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = f."STUDENT_ID"
      INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = s."PERSON_ID"
      WHERE f."FOLLOW_UP_ID" = $1
    `

    const [record] = await queryRunner<FollowUp>(statement, [followUpId])

    if (!record) {
      throw new NotFoundError(
        `El seguimiento con identificador '${followUpId}' no existe.`
      )
    }

    return this.success({ data: record })
  }

  private async ensureRelations(payload: Partial<CreateFollowUpPayload>) {
    if (payload.STUDENT_ID) {
      const student = await this.studentRepository.findOne({
        where: { STUDENT_ID: payload.STUDENT_ID },
      })
      if (!student) {
        throw new NotFoundError(
          `El becario con id '${payload.STUDENT_ID}' no existe.`
        )
      }
    }

    if (payload.APPOINTMENT_ID) {
      const appointment = await this.appointmentRepository.findOne({
        where: { APPOINTMENT_ID: payload.APPOINTMENT_ID },
      })
      if (!appointment) {
        throw new NotFoundError(
          `La cita con id '${payload.APPOINTMENT_ID}' no existe.`
        )
      }
    }
  }

  private async updateStudentTracking(
    studentId: number,
    followUpDate: Date,
    nextAppointment: Date | null
  ) {
    await this.studentRepository.update(
      { STUDENT_ID: studentId },
      {
        LAST_FOLLOW_UP: followUpDate,
        NEXT_APPOINTMENT: nextAppointment,
      }
    )
  }
}
