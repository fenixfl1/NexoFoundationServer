import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { StudentRequirement } from '@src/entity/StudentRequirement'
import { Requirement } from '@src/entity/Requirement'
import { Student } from '@src/entity/Student'
import { NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateStudentRequirementPayload {
  STUDENT_ID: number
  REQUIREMENT_ID: number
  STATUS?: string
  OBSERVATION?: string | null
  VALIDATED_BY?: number | null
  VALIDATED_AT?: string | Date | null
  STATE?: string
}

interface UpdateStudentRequirementPayload
  extends Partial<CreateStudentRequirementPayload> {
  STUDENT_REQUIREMENT_ID: number
}

const requirementStatus = ['P', 'R', 'A', 'D']

export class StudentRequirementService extends BaseService {
  private studentRequirementRepository: Repository<StudentRequirement>
  private requirementRepository: Repository<Requirement>
  private studentRepository: Repository<Student>

  constructor() {
    super()
    this.studentRequirementRepository =
      this.dataSource.getRepository(StudentRequirement)
    this.requirementRepository = this.dataSource.getRepository(Requirement)
    this.studentRepository = this.dataSource.getRepository(Student)
  }

  @CatchServiceError()
  async create(
    payload: CreateStudentRequirementPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    await this.ensureStudent(payload.STUDENT_ID)
    await this.ensureRequirement(payload.REQUIREMENT_ID)

    const studentRequirement = this.studentRequirementRepository.create({
      ...payload,
      STATUS: payload.STATUS ?? 'P',
      STATE: payload.STATE ?? 'A',
      CREATED_BY: session.userId,
      VALIDATED_AT: payload.VALIDATED_AT
        ? new Date(payload.VALIDATED_AT)
        : null,
    })

    await this.studentRequirementRepository.save(studentRequirement)

    return this.success({
      message: 'Validación registrada correctamente.',
      data: studentRequirement,
    })
  }

  @CatchServiceError()
  async update(
    payload: UpdateStudentRequirementPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const { STUDENT_REQUIREMENT_ID, ...rest } = payload

    const existing = await this.studentRequirementRepository.findOne({
      where: { STUDENT_REQUIREMENT_ID },
    })

    if (!existing) {
      throw new NotFoundError(
        `La validación con id '${STUDENT_REQUIREMENT_ID}' no existe.`
      )
    }

    const shouldStamp = rest.STATUS && rest.STATUS !== existing.STATUS

    await this.studentRequirementRepository.update(
      { STUDENT_REQUIREMENT_ID },
      {
        ...rest,
        VALIDATED_BY: shouldStamp ? session.userId : existing.VALIDATED_BY,
        VALIDATED_AT: shouldStamp ? new Date() : existing.VALIDATED_AT,
      }
    )

    return this.success({ message: 'Validación actualizada correctamente.' })
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
          sr."STUDENT_REQUIREMENT_ID",
          sr."STUDENT_ID",
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
          r."IS_REQUIRED",
          s."PERSON_ID",
          p."NAME",
          p."LAST_NAME",
          p."IDENTITY_DOCUMENT",
          s."UNIVERSITY",
          s."CAREER",
          (
            p."NAME" || ' ' ||
            p."LAST_NAME" || ' ' ||
            p."IDENTITY_DOCUMENT" || ' ' ||
            r."NAME" || ' ' ||
            r."REQUIREMENT_KEY"
          ) AS "FILTER"
        FROM PUBLIC."STUDENT_REQUIREMENT" sr
        INNER JOIN PUBLIC."REQUIREMENT" r
          ON r."REQUIREMENT_ID" = sr."REQUIREMENT_ID"
        INNER JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = sr."STUDENT_ID"
        INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = s."PERSON_ID"
      ) AS student_requirements_subquery
      ${whereClause}
      ORDER BY "STUDENT_REQUIREMENT_ID" DESC
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
        summary_subquery."STATUS",
        COUNT(*)::INTEGER AS "COUNT"
      FROM (${statement}) AS summary_subquery
      GROUP BY summary_subquery."STATUS"
    `

    const summaryRows = await queryRunner<{ STATUS: string; COUNT: number }>(
      summaryStatement,
      values
    )

    const summary = requirementStatus.reduce<Record<string, number>>(
      (acc, status) => {
        acc[status] = 0
        return acc
      },
      {}
    )

    summaryRows.forEach(({ STATUS, COUNT }) => {
      summary[STATUS] = COUNT
    })

    return this.success({ data, metadata: { ...metadata, summary } })
  }

  @CatchServiceError()
  async get_student_requirement(
    studentRequirementId: number
  ): Promise<ApiResponse> {
    const studentRequirement = await this.studentRequirementRepository.findOne({
      where: { STUDENT_REQUIREMENT_ID: studentRequirementId },
    })

    if (!studentRequirement) {
      throw new NotFoundError(
        `La validación con id '${studentRequirementId}' no existe.`
      )
    }

    return this.success({ data: studentRequirement })
  }

  private async ensureRequirement(requirementId: number) {
    const exists = await this.requirementRepository.findOne({
      where: { REQUIREMENT_ID: requirementId },
    })

    if (!exists) {
      throw new NotFoundError(
        `El requisito con id '${requirementId}' no existe.`
      )
    }
  }

  private async ensureStudent(studentId: number) {
    const exists = await this.studentRepository.findOne({
      where: { STUDENT_ID: studentId },
    })

    if (!exists) {
      throw new NotFoundError(
        `El becario con id '${studentId}' no existe.`
      )
    }
  }
}
