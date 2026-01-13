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

    return this.success({ data: student })
  }
}
