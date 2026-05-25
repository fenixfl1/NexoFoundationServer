import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { Student } from '@src/entity/Student'
import { NotFoundError, DbConflictError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateStudentPayload {
  PERSON_ID: number
  UNIVERSITY: string
  CAREER: string
  SCHOLARSHIP_STATUS: Student['SCHOLARSHIP_STATUS']
  ACADEMIC_AVERAGE?: number
  HOURS_REQUIRED?: number
  HOURS_COMPLETED?: number
  LAST_FOLLOW_UP?: string
  NEXT_APPOINTMENT?: string
  COHORT?: string | null
  CAMPUS?: string | null
  SCORE?: number | null
}

interface UpdateStudentPayload extends Partial<CreateStudentPayload> {
  STUDENT_ID: number
}

export class StudentService extends BaseService {
  private studentRepository: Repository<Student>

  constructor() {
    super()
    this.studentRepository = this.dataSource.getRepository(Student)
  }

  @CatchServiceError()
  async create(
    payload: CreateStudentPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const { PERSON_ID } = payload

    const person = await this.personRepository.findOne({
      where: { PERSON_ID },
    })

    if (!person) {
      throw new NotFoundError(
        `La persona con identificador '${PERSON_ID}' no fue encontrada.`
      )
    }

    const existing = await this.studentRepository.findOne({
      where: { PERSON_ID },
    })

    if (existing) {
      throw new DbConflictError(
        `La persona '${PERSON_ID}' ya tiene un perfil de becario asignado.`
      )
    }

    const student = this.studentRepository.create({
      ...payload,
      CREATED_BY: session.userId,
    })

    await this.studentRepository.save(student)

    await this.dataSource.query(
      `
        INSERT INTO "STUDENT_REQUIREMENT" (
          "CREATED_AT",
          "CREATED_BY",
          "STATE",
          "STUDENT_ID",
          "REQUIREMENT_ID",
          "STATUS"
        )
        SELECT
          NOW(),
          $1,
          'A',
          $2,
          r."REQUIREMENT_ID",
          'P'
        FROM PUBLIC."REQUIREMENT" r
        WHERE r."STATE" = 'A'
        ON CONFLICT ("STUDENT_ID", "REQUIREMENT_ID") DO NOTHING
      `,
      [session.userId, student.STUDENT_ID]
    )

    return this.success({
      message: 'Becario registrado correctamente.',
      data: student,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateStudentPayload): Promise<ApiResponse> {
    const { STUDENT_ID, ...rest } = payload

    const student = await this.studentRepository.findOne({
      where: { STUDENT_ID },
    })

    if (!student) {
      throw new NotFoundError(
        `El becario con identificador '${STUDENT_ID}' no fue encontrado.`
      )
    }

    await this.studentRepository.update({ STUDENT_ID }, { ...rest })

    return this.success({
      message: 'Información del becario actualizada.',
      data: { ...student, ...rest },
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
          s."STUDENT_ID",
          s."CREATED_AT",
          s."PERSON_ID",
          s."UNIVERSITY",
          s."CAREER",
          s."SCHOLARSHIP_STATUS",
          s."ACADEMIC_AVERAGE",
          s."HOURS_REQUIRED",
          s."HOURS_COMPLETED",
          s."LAST_FOLLOW_UP",
          s."NEXT_APPOINTMENT",
          s."COHORT",
          s."CAMPUS",
          s."SCORE",
          p."NAME",
          p."LAST_NAME",
          p."BIRTH_DATE",
          p."DOCUMENT_TYPE",
          p."GENDER",
          p."IDENTITY_DOCUMENT",
          p."STATE",
          COALESCE(email."VALUE", '') AS "CONTACT_EMAIL",
          COALESCE(phone."VALUE", '') AS "CONTACT_PHONE",
          (
            p."NAME" || ' ' ||
            p."LAST_NAME" || ' ' ||
            p."IDENTITY_DOCUMENT" || ' ' ||
            COALESCE(s."UNIVERSITY", '') || ' ' ||
            COALESCE(s."CAREER", '')
          ) AS "FILTER"
        FROM
          PUBLIC."STUDENT" s
        INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = s."PERSON_ID"
        LEFT JOIN PUBLIC."CONTACT" email
          ON email."PERSON_ID" = p."PERSON_ID"
          AND email."IS_PRIMARY" = TRUE
          AND email."TYPE" = 'email'
        LEFT JOIN PUBLIC."CONTACT" phone
          ON phone."PERSON_ID" = p."PERSON_ID"
          AND phone."IS_PRIMARY" = TRUE
          AND phone."TYPE" = 'phone'
      ) AS SUBQUERY
      ${whereClause}
      ORDER BY "STUDENT_ID"
    `

    const [data, metadata] = await paginatedQuery<Student>({
      statement,
      values,
      pagination,
    })

    if (!data.length) {
      return this.success({ status: HTTP_STATUS_NO_CONTENT })
    }

    const statusCountStatement = `
      SELECT
        status_subquery."SCHOLARSHIP_STATUS",
        COUNT(*)::INTEGER AS "COUNT"
      FROM (${statement}) AS status_subquery
      GROUP BY status_subquery."SCHOLARSHIP_STATUS"
    `

    const statusCounts = await queryRunner<{
      SCHOLARSHIP_STATUS: Student['SCHOLARSHIP_STATUS']
      COUNT: number
    }>(statusCountStatement, values)

    const statusSummary = statusCounts.reduce<Record<string, number>>(
      (acc, { SCHOLARSHIP_STATUS, COUNT }) => {
        acc[SCHOLARSHIP_STATUS] = COUNT
        return acc
      },
      {}
    )

    return this.success({
      data,
      metadata: { ...metadata, summary: statusSummary },
    })
  }

  @CatchServiceError()
  async get_student(studentId: number): Promise<ApiResponse> {
    const statement = `
      SELECT
        s.*,
        p."NAME",
        p."LAST_NAME",
        p."BIRTH_DATE",
        p."DOCUMENT_TYPE",
        p."GENDER",
        p."IDENTITY_DOCUMENT",
        COALESCE(email."VALUE", '') AS "CONTACT_EMAIL",
        COALESCE(phone."VALUE", '') AS "CONTACT_PHONE"
      FROM PUBLIC."STUDENT" s
      INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = s."PERSON_ID"
      LEFT JOIN PUBLIC."CONTACT" email
        ON email."PERSON_ID" = p."PERSON_ID"
        AND email."IS_PRIMARY" = TRUE
        AND email."TYPE" = 'email'
      LEFT JOIN PUBLIC."CONTACT" phone
        ON phone."PERSON_ID" = p."PERSON_ID"
        AND phone."IS_PRIMARY" = TRUE
        AND phone."TYPE" = 'phone'
      WHERE s."STUDENT_ID" = $1
    `

    const [student] = await queryRunner<Student>(statement, [studentId])

    if (!student) {
      throw new NotFoundError(
        `El becario con identificador '${studentId}' no fue encontrado.`
      )
    }

    const [
      terms,
      documents,
      requirements,
      requests,
      followUps,
      scholarships,
      disbursements,
      activities,
    ] = await Promise.all([
      this.getStudentTerms(studentId),
      this.getStudentDocuments(studentId),
      this.getStudentRequirements(studentId),
      this.getStudentRequests(studentId, student.PERSON_ID),
      this.getStudentFollowUps(studentId),
      this.getStudentScholarships(studentId),
      this.getStudentDisbursements(studentId),
      this.getStudentActivities(studentId),
    ])

    const totalDisbursed = disbursements.reduce(
      (sum, item) => sum + Number(item.AMOUNT ?? 0),
      0
    )
    const completedActivities = activities.filter(
      (item) => item.STATUS === 'completed'
    ).length
    const completedRequirements = requirements.filter(
      (item) => item.STATUS === 'A'
    ).length

    return this.success({
      data: {
        ...student,
        TERMS: terms,
        DOCUMENTS: documents,
        REQUIREMENTS: requirements,
        REQUESTS: requests,
        FOLLOW_UPS: followUps,
        SCHOLARSHIPS: scholarships,
        DISBURSEMENTS: disbursements,
        ACTIVITIES: activities,
        EXPEDIENT_SUMMARY: {
          TERMS_COUNT: terms.length,
          DOCUMENTS_COUNT: documents.length,
          REQUIREMENTS_COUNT: requirements.length,
          REQUIREMENTS_COMPLETED: completedRequirements,
          REQUESTS_COUNT: requests.length,
          FOLLOW_UPS_COUNT: followUps.length,
          SCHOLARSHIPS_COUNT: scholarships.length,
          DISBURSEMENTS_COUNT: disbursements.length,
          TOTAL_DISBURSED: totalDisbursed,
          ACTIVITIES_COUNT: activities.length,
          ACTIVITIES_COMPLETED: completedActivities,
        },
      },
    })
  }

  private async getStudentTerms(studentId: number) {
    return queryRunner(
      `
        SELECT
          t."TERM_ID",
          t."PERIOD",
          t."TERM_INDEX",
          t."TOTAL_CREDITS",
          t."OBSERVATIONS",
          t."CAPTURE_FILE_NAME",
          t."CREATED_AT",
          COALESCE(
            json_agg(
              json_build_object(
                'COURSE_GRADE_ID', cg."COURSE_GRADE_ID",
                'COURSE_NAME', cg."COURSE_NAME",
                'GRADE', cg."GRADE",
                'CREDITS', cg."CREDITS",
                'STATUS', cg."STATUS"
              )
              ORDER BY cg."COURSE_GRADE_ID"
            ) FILTER (WHERE cg."COURSE_GRADE_ID" IS NOT NULL),
            '[]'::json
          ) AS "COURSES"
        FROM PUBLIC."TERM" t
        LEFT JOIN PUBLIC."COURSE_GRADE" cg ON cg."TERM_ID" = t."TERM_ID"
        WHERE t."STUDENT_ID" = $1
        GROUP BY t."TERM_ID"
        ORDER BY t."CREATED_AT" DESC, t."TERM_ID" DESC
      `,
      [studentId]
    )
  }

  private async getStudentDocuments(studentId: number) {
    return queryRunner(
      `
        SELECT
          d."DOCUMENT_ID",
          d."DOCUMENT_TYPE",
          d."FILE_NAME",
          d."MIME_TYPE",
          d."SIGNED_AT",
          d."DESCRIPTION",
          d."STATE",
          d."CREATED_AT"
        FROM PUBLIC."STUDENT_DOCUMENT" d
        WHERE d."STUDENT_ID" = $1
        ORDER BY d."CREATED_AT" DESC, d."DOCUMENT_ID" DESC
      `,
      [studentId]
    )
  }

  private async getStudentRequirements(studentId: number) {
    return queryRunner(
      `
        SELECT
          sr."STUDENT_REQUIREMENT_ID",
          sr."REQUIREMENT_ID",
          sr."STATUS",
          sr."OBSERVATION",
          sr."VALIDATED_BY",
          sr."VALIDATED_AT",
          sr."STATE",
          sr."CREATED_AT",
          r."REQUIREMENT_KEY",
          r."NAME" AS "REQUIREMENT_NAME",
          r."DESCRIPTION" AS "REQUIREMENT_DESCRIPTION",
          r."IS_REQUIRED"
        FROM PUBLIC."STUDENT_REQUIREMENT" sr
        INNER JOIN PUBLIC."REQUIREMENT" r
          ON r."REQUIREMENT_ID" = sr."REQUIREMENT_ID"
        WHERE sr."STUDENT_ID" = $1
        ORDER BY r."IS_REQUIRED" DESC, r."NAME" ASC
      `,
      [studentId]
    )
  }

  private async getStudentRequests(studentId: number, personId: number) {
    return queryRunner(
      `
        SELECT
          r."REQUEST_ID",
          r."REQUEST_TYPE",
          r."STATUS",
          r."ASSIGNED_COORDINATOR",
          r."NEXT_APPOINTMENT",
          r."COHORT",
          r."NOTES",
          r."CREATED_AT"
        FROM PUBLIC."REQUEST" r
        WHERE r."STUDENT_ID" = $1 OR r."PERSON_ID" = $2
        ORDER BY r."CREATED_AT" DESC, r."REQUEST_ID" DESC
      `,
      [studentId, personId]
    )
  }

  private async getStudentFollowUps(studentId: number) {
    return queryRunner(
      `
        SELECT
          f."FOLLOW_UP_ID",
          f."APPOINTMENT_ID",
          f."FOLLOW_UP_DATE",
          f."SUMMARY",
          f."NOTES",
          f."NEXT_APPOINTMENT",
          f."STATUS",
          f."STATE",
          f."CREATED_AT"
        FROM PUBLIC."FOLLOW_UP" f
        WHERE f."STUDENT_ID" = $1
        ORDER BY f."FOLLOW_UP_DATE" DESC, f."FOLLOW_UP_ID" DESC
      `,
      [studentId]
    )
  }

  private async getStudentScholarships(studentId: number) {
    return queryRunner(
      `
        SELECT
          sc."SCHOLARSHIP_ID",
          sc."REQUEST_ID",
          sc."NAME",
          sc."DESCRIPTION",
          sc."AMOUNT",
          sc."START_DATE",
          sc."END_DATE",
          sc."PERIOD_TYPE",
          sc."STATUS",
          sc."STATE",
          sc."CREATED_AT"
        FROM PUBLIC."SCHOLARSHIP" sc
        WHERE sc."STUDENT_ID" = $1
        ORDER BY sc."START_DATE" DESC, sc."SCHOLARSHIP_ID" DESC
      `,
      [studentId]
    )
  }

  private async getStudentDisbursements(studentId: number) {
    return queryRunner(
      `
        SELECT
          d."DISBURSEMENT_ID",
          d."SCHOLARSHIP_ID",
          sc."NAME" AS "SCHOLARSHIP_NAME",
          d."AMOUNT",
          d."DISBURSEMENT_DATE",
          d."METHOD",
          d."REFERENCE",
          d."STATUS",
          d."NOTES",
          d."STATE",
          d."CREATED_AT"
        FROM PUBLIC."DISBURSEMENT" d
        INNER JOIN PUBLIC."SCHOLARSHIP" sc
          ON sc."SCHOLARSHIP_ID" = d."SCHOLARSHIP_ID"
        WHERE sc."STUDENT_ID" = $1
        ORDER BY d."DISBURSEMENT_DATE" DESC, d."DISBURSEMENT_ID" DESC
      `,
      [studentId]
    )
  }

  private async getStudentActivities(studentId: number) {
    return queryRunner(
      `
        SELECT
          ap."PARTICIPANT_ID",
          ap."ACTIVITY_ID",
          a."TITLE",
          a."START_AT",
          a."END_AT",
          a."LOCATION",
          a."HOURS",
          ap."HOURS_EARNED",
          ap."STATUS",
          ap."ATTENDED_AT",
          ap."CREATED_AT"
        FROM PUBLIC."ACTIVITY_PARTICIPANT" ap
        INNER JOIN PUBLIC."ACTIVITY" a ON a."ACTIVITY_ID" = ap."ACTIVITY_ID"
        WHERE ap."STUDENT_ID" = $1
        ORDER BY a."START_AT" DESC, ap."PARTICIPANT_ID" DESC
      `,
      [studentId]
    )
  }
}
