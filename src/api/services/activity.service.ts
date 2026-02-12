import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { Activity, ActivityStatus } from '@src/entity/Activity'
import {
  ActivityParticipant,
  ParticipantStatus,
} from '@src/entity/ActivityParticipant'
import { Student } from '@src/entity/Student'
import { NotFoundError, BadRequestError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateActivityPayload {
  TITLE: string
  DESCRIPTION?: string | null
  START_AT: string
  END_AT?: string | null
  LOCATION?: string | null
  HOURS: number
  CAPACITY?: number | null
  STATUS?: ActivityStatus
}

interface UpdateActivityPayload extends Partial<CreateActivityPayload> {
  ACTIVITY_ID: number
}

interface EnrollPayload {
  ACTIVITY_ID: number
  STUDENT_ID: number
}

interface UpdateParticipantPayload {
  PARTICIPANT_ID: number
  STATUS: ParticipantStatus
  HOURS_EARNED?: number
}

export class ActivityService extends BaseService {
  private activityRepository: Repository<Activity>
  private participantRepository: Repository<ActivityParticipant>
  private studentRepository: Repository<Student>

  constructor() {
    super()
    this.activityRepository = this.dataSource.getRepository(Activity)
    this.participantRepository =
      this.dataSource.getRepository(ActivityParticipant)
    this.studentRepository = this.dataSource.getRepository(Student)
  }

  @CatchServiceError()
  async create(
    payload: CreateActivityPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const activity = this.activityRepository.create({
      ...payload,
      START_AT: new Date(payload.START_AT),
      END_AT: payload.END_AT ? new Date(payload.END_AT) : null,
      CREATED_BY: session.userId,
    })

    await this.activityRepository.save(activity)
    return this.success({
      message: 'Actividad registrada.',
      data: activity,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateActivityPayload): Promise<ApiResponse> {
    const { ACTIVITY_ID, ...rest } = payload
    const activity = await this.activityRepository.findOne({
      where: { ACTIVITY_ID },
    })
    if (!activity) {
      throw new NotFoundError(
        `La actividad con id '${ACTIVITY_ID}' no fue encontrada.`
      )
    }

    await this.activityRepository.update(
      { ACTIVITY_ID },
      {
        ...rest,
        START_AT: rest.START_AT ? new Date(rest.START_AT) : activity.START_AT,
        END_AT: rest.END_AT ? new Date(rest.END_AT) : activity.END_AT,
      }
    )

    return this.success({ message: 'Actividad actualizada.' })
  }

  @CatchServiceError()
  async get_activity(activityId: number): Promise<ApiResponse> {
    const activity = await this.activityRepository.findOne({
      where: { ACTIVITY_ID: activityId },
      relations: ['PARTICIPANTS', 'PARTICIPANTS.STUDENT'],
    })

    if (!activity) {
      throw new NotFoundError(
        `La actividad con id '${activityId}' no fue encontrada.`
      )
    }

    return this.success({ data: activity })
  }

  @CatchServiceError()
  async get_pagination(
    payload: AdvancedCondition[],
    pagination: Pagination
  ): Promise<ApiResponse> {
    const { values, whereClause } = whereClauseBuilder(payload)

    const statement = `
      SELECT
        a."ACTIVITY_ID",
        a."TITLE",
        a."DESCRIPTION",
        a."START_AT",
        a."END_AT",
        a."LOCATION",
        a."HOURS",
        a."CAPACITY",
        a."STATUS",
        (
          SELECT COUNT(*)::INTEGER
          FROM "ACTIVITY_PARTICIPANT" ap
          WHERE ap."ACTIVITY_ID" = a."ACTIVITY_ID"
        ) AS "ENROLLED",
        (
          a."TITLE" || ' ' ||
          COALESCE(a."DESCRIPTION", '') || ' ' ||
          COALESCE(a."LOCATION", '')
        ) AS "FILTER"
      FROM PUBLIC."ACTIVITY" a
      ${whereClause}
      ORDER BY a."START_AT" DESC, a."ACTIVITY_ID" DESC
    `

    const [data, metadata] = await paginatedQuery<any>({
      statement,
      values,
      pagination,
    })

    if (!data.length) {
      return this.success({
        status: HTTP_STATUS_NO_CONTENT,
        metadata,
      })
    }

    return this.success({ data, metadata })
  }

  @CatchServiceError()
  async enroll(
    payload: EnrollPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const activity = await this.activityRepository.findOne({
      where: { ACTIVITY_ID: payload.ACTIVITY_ID },
    })
    if (!activity) {
      throw new NotFoundError(
        `La actividad con id '${payload.ACTIVITY_ID}' no existe.`
      )
    }

    await this.ensureStudent(payload.STUDENT_ID)

    const existing = await this.participantRepository.findOne({
      where: {
        ACTIVITY_ID: payload.ACTIVITY_ID,
        STUDENT_ID: payload.STUDENT_ID,
      },
    })

    if (existing) {
      throw new BadRequestError('El becario ya está inscrito en la actividad.')
    }

    const participant = this.participantRepository.create({
      ...payload,
      HOURS_EARNED: Number(activity.HOURS) || 0,
      CREATED_BY: session.userId,
    })

    await this.participantRepository.save(participant)
    return this.success({
      message: 'Becario inscrito correctamente.',
      data: participant,
    })
  }

  @CatchServiceError()
  async updateParticipant(
    payload: UpdateParticipantPayload
  ): Promise<ApiResponse> {
    const participant = await this.participantRepository.findOne({
      where: { PARTICIPANT_ID: payload.PARTICIPANT_ID },
      relations: ['ACTIVITY'],
    })

    if (!participant) {
      throw new NotFoundError(
        `El registro de participación con id '${payload.PARTICIPANT_ID}' no fue encontrado.`
      )
    }

    const nextStatus = payload.STATUS
    const hoursEarned =
      payload.HOURS_EARNED ?? participant.HOURS_EARNED ?? participant.ACTIVITY?.HOURS ?? 0

    const wasCompleted = participant.STATUS === ParticipantStatus.COMPLETED
    const willBeCompleted = nextStatus === ParticipantStatus.COMPLETED

    await this.participantRepository.update(
      { PARTICIPANT_ID: payload.PARTICIPANT_ID },
      {
        STATUS: nextStatus,
        HOURS_EARNED: hoursEarned,
        ATTENDED_AT: willBeCompleted ? new Date() : participant.ATTENDED_AT,
      }
    )

    if (willBeCompleted && !wasCompleted) {
      await this.incrementStudentHours(participant.STUDENT_ID, hoursEarned)
    }

    return this.success({ message: 'Participación actualizada.' })
  }

  private async ensureStudent(studentId: number) {
    const student = await this.studentRepository.findOne({
      where: { STUDENT_ID: studentId },
    })
    if (!student) {
      throw new NotFoundError(
        `El becario con identificador '${studentId}' no fue encontrado.`
      )
    }
  }

  private async incrementStudentHours(studentId: number, hours: number) {
    await this.studentRepository
      .createQueryBuilder()
      .update()
      .set({
        HOURS_COMPLETED: () => `"HOURS_COMPLETED" + ${Number(hours) || 0}`,
      })
      .where('"STUDENT_ID" = :studentId', { studentId })
      .execute()
  }
}
