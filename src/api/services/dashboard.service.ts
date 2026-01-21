import { ApiResponse, SessionInfo } from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { queryRunner } from '@src/helpers/query-utils'
import { NotFoundError } from '@src/errors/http.error'
import { Student } from '@src/entity/Student'

const ROLE_STUDENT_ID = 3

type DashboardMetrics = {
  role: 'student' | 'admin'
  metrics: Record<string, number | string | null>
}

type DashboardActivityItem = {
  type: string
  title: string
  description: string
  occurred_at: string
}

export class DashboardService extends BaseService {
  @CatchServiceError()
  async get_metrics(session: SessionInfo): Promise<ApiResponse<DashboardMetrics>> {
    const isStudent = await this.userRolesRepository.findOne({
      where: { USER_ID: session.userId, ROLE_ID: ROLE_STUDENT_ID },
    })

    if (isStudent) {
      return this.getStudentMetrics(session)
    }

    return this.getAdminMetrics()
  }

  private async getStudentMetrics(
    session: SessionInfo
  ): Promise<ApiResponse<DashboardMetrics>> {
    const { student, studentId } = await this.getStudentFromSession(session)

    const requiredRows = await queryRunner<{ count: number }>(
        `
        SELECT COUNT(*)::int AS count
        FROM PUBLIC."REQUIREMENT"
        WHERE "STATE" = 'A' AND "IS_REQUIRED" = true
      `
      )
    const requiredCount = requiredRows[0]?.count ?? 0

    const receivedRows = await queryRunner<{ count: number }>(
        `
        SELECT COUNT(DISTINCT r."REQUIREMENT_ID")::int AS count
        FROM PUBLIC."STUDENT_DOCUMENT" d
        INNER JOIN PUBLIC."REQUIREMENT" r
          ON (
            LOWER(r."REQUIREMENT_KEY") = LOWER(d."DOCUMENT_TYPE")
            OR LOWER(r."NAME") = LOWER(d."DOCUMENT_TYPE")
          )
        WHERE d."STUDENT_ID" = $1
          AND d."STATE" = 'A'
          AND r."STATE" = 'A'
          AND r."IS_REQUIRED" = true
      `,
        [studentId]
      )
    const receivedCount = receivedRows[0]?.count ?? 0

    const documentsRows = await queryRunner<{ count: number }>(
        `
        SELECT COUNT(*)::int AS count
        FROM PUBLIC."STUDENT_DOCUMENT"
        WHERE "STUDENT_ID" = $1 AND "STATE" = 'A'
      `,
        [studentId]
      )
    const documentsUploaded = documentsRows[0]?.count ?? 0

    const appointmentsRows = await queryRunner<{ count: number }>(
        `
        SELECT COUNT(*)::int AS count
        FROM PUBLIC."APPOINTMENT"
        WHERE "STUDENT_ID" = $1
          AND "STATUS" = 'scheduled'
          AND "START_AT" >= NOW()
      `,
        [studentId]
      )
    const appointmentsUpcoming = appointmentsRows[0]?.count ?? 0

    const requestsRows = await queryRunner<{ count: number }>(
        `
        SELECT COUNT(*)::int AS count
        FROM PUBLIC."REQUEST"
        WHERE "STUDENT_ID" = $1
          AND "STATUS" IN ('P', 'R', 'C')
      `,
        [studentId]
      )
    const requestsActive = requestsRows[0]?.count ?? 0

    const pendingDocuments = Math.max(
      Number(requiredCount) - Number(receivedCount),
      0
    )

    return this.success({
      data: {
        role: 'student',
        metrics: {
          documentsPending: pendingDocuments,
          documentsUploaded,
          appointmentsUpcoming,
          requestsActive,
          academicAverage: student.ACADEMIC_AVERAGE ?? null,
        },
      },
    })
  }

  private async getAdminMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    const requestsPendingRows = await queryRunner<{ count: number }>(
        `
        SELECT COUNT(*)::int AS count
        FROM PUBLIC."REQUEST"
        WHERE "STATUS" = 'P'
      `
      )
    const requestsPending = requestsPendingRows[0]?.count ?? 0

    const requestsReviewRows = await queryRunner<{ count: number }>(
        `
        SELECT COUNT(*)::int AS count
        FROM PUBLIC."REQUEST"
        WHERE "STATUS" = 'R'
      `
      )
    const requestsInReview = requestsReviewRows[0]?.count ?? 0

    const requirementsRows = await queryRunner<{ count: number }>(
        `
        SELECT COUNT(*)::int AS count
        FROM PUBLIC."STUDENT_REQUIREMENT"
        WHERE "STATUS" = 'P' AND "STATE" = 'A'
      `
      )
    const requirementsPending = requirementsRows[0]?.count ?? 0

    const scholarshipsRows = await queryRunner<{ count: number }>(
        `
        SELECT COUNT(*)::int AS count
        FROM PUBLIC."SCHOLARSHIP"
        WHERE "STATUS" = 'A' AND "STATE" = 'A'
      `
      )
    const scholarshipsActive = scholarshipsRows[0]?.count ?? 0

    const disbursementsRows = await queryRunner<{ count: number }>(
        `
        SELECT COUNT(*)::int AS count
        FROM PUBLIC."DISBURSEMENT"
        WHERE "STATUS" = 'P' AND "STATE" = 'A'
      `
      )
    const disbursementsPending = disbursementsRows[0]?.count ?? 0

    return this.success({
      data: {
        role: 'admin',
        metrics: {
          requestsPending,
          requestsInReview,
          requirementsPending,
          scholarshipsActive,
          disbursementsPending,
        },
      },
    })
  }

  @CatchServiceError()
  async get_activity(
    session: SessionInfo
  ): Promise<ApiResponse<DashboardActivityItem[]>> {
    const student = await this.getStudentIdForSession(session)
    const studentFilter = student ? 'AND ref."STUDENT_ID" = $1' : ''
    const params = student ? [student] : []

    const statement = `
      SELECT *
      FROM (
        SELECT
          d."STUDENT_ID",
          'document' AS type,
          'Documento subido' AS title,
          d."DOCUMENT_TYPE" || COALESCE(' · ' || d."FILE_NAME", '') AS description,
          d."CREATED_AT" AS occurred_at
        FROM PUBLIC."STUDENT_DOCUMENT" d
        WHERE d."STATE" = 'A'

        UNION ALL

        SELECT
          sr."STUDENT_ID",
          'validation' AS type,
          CASE
            WHEN sr."STATUS" = 'A' THEN 'Requisito aprobado'
            WHEN sr."STATUS" = 'D' THEN 'Requisito rechazado'
            ELSE 'Requisito actualizado'
          END AS title,
          r."NAME" AS description,
          COALESCE(sr."VALIDATED_AT", sr."CREATED_AT") AS occurred_at
        FROM PUBLIC."STUDENT_REQUIREMENT" sr
        INNER JOIN PUBLIC."REQUIREMENT" r
          ON r."REQUIREMENT_ID" = sr."REQUIREMENT_ID"
        WHERE sr."STATE" = 'A'
          AND sr."VALIDATED_AT" IS NOT NULL

        UNION ALL

        SELECT
          req."STUDENT_ID",
          'request' AS type,
          'Solicitud registrada' AS title,
          req."REQUEST_TYPE" || ' · ' || req."STATUS" AS description,
          req."CREATED_AT" AS occurred_at
        FROM PUBLIC."REQUEST" req
      ) AS ref
      WHERE 1=1
      ${studentFilter}
      ORDER BY ref."occurred_at" DESC
      LIMIT 10
    `

    const data = await queryRunner<DashboardActivityItem>(statement, params)

    return this.success({ data })
  }

  private async getStudentFromSession(session: SessionInfo) {
    const user = await this.userRepository.findOne({
      where: { USER_ID: session.userId },
    })

    if (!user) {
      throw new NotFoundError('Usuario no encontrado.')
    }

    const student = await this.dataSource.getRepository(Student).findOne({
      where: { PERSON_ID: user.PERSON_ID },
    })

    if (!student) {
      throw new NotFoundError('Estudiante no encontrado.')
    }

    return { student, studentId: student.STUDENT_ID }
  }

  private async getStudentIdForSession(
    session: SessionInfo
  ): Promise<number | null> {
    const isStudent = await this.userRolesRepository.findOne({
      where: { USER_ID: session.userId, ROLE_ID: ROLE_STUDENT_ID },
    })

    if (!isStudent) return null

    const { studentId } = await this.getStudentFromSession(session)
    return studentId
  }
}
