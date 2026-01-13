import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { Requirement } from '@src/entity/Requirement'
import { StudentRequirement } from '@src/entity/StudentRequirement'
import { Student } from '@src/entity/Student'
import { DbConflictError, NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateRequirementPayload {
  REQUIREMENT_KEY: string
  NAME: string
  DESCRIPTION?: string | null
  IS_REQUIRED?: boolean
  STATE?: string
}

interface UpdateRequirementPayload extends Partial<CreateRequirementPayload> {
  REQUIREMENT_ID: number
}

export class RequirementService extends BaseService {
  private requirementRepository: Repository<Requirement>
  private studentRepository: Repository<Student>
  private studentRequirementRepository: Repository<StudentRequirement>

  constructor() {
    super()
    this.requirementRepository = this.dataSource.getRepository(Requirement)
    this.studentRepository = this.dataSource.getRepository(Student)
    this.studentRequirementRepository =
      this.dataSource.getRepository(StudentRequirement)
  }

  @CatchServiceError()
  async create(
    payload: CreateRequirementPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    await this.ensureUniqueKey(payload.REQUIREMENT_KEY)

    const requirement = this.requirementRepository.create({
      ...payload,
      IS_REQUIRED: payload.IS_REQUIRED ?? true,
      STATE: payload.STATE ?? 'A',
      CREATED_BY: session.userId,
    })

    await this.requirementRepository.save(requirement)

    await this.createStudentRequirementRecords(
      requirement.REQUIREMENT_ID,
      session.userId
    )

    await this.dataSource.query(
      `
        UPDATE "STUDENT_REQUIREMENT" sr
        SET "STATUS" = 'R'
        FROM "STUDENT_DOCUMENT" d
        WHERE sr."REQUIREMENT_ID" = $1
          AND sr."STUDENT_ID" = d."STUDENT_ID"
          AND d."DOCUMENT_TYPE" = $2
          AND sr."STATUS" = 'P'
      `,
      [requirement.REQUIREMENT_ID, requirement.REQUIREMENT_KEY]
    )

    return this.success({
      message: 'Requisito registrado correctamente.',
      data: requirement,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateRequirementPayload): Promise<ApiResponse> {
    const { REQUIREMENT_ID, ...rest } = payload

    const existing = await this.requirementRepository.findOne({
      where: { REQUIREMENT_ID },
    })

    if (!existing) {
      throw new NotFoundError(
        `El requisito con id '${REQUIREMENT_ID}' no existe.`
      )
    }

    if (
      rest.REQUIREMENT_KEY &&
      rest.REQUIREMENT_KEY !== existing.REQUIREMENT_KEY
    ) {
      await this.ensureUniqueKey(rest.REQUIREMENT_KEY, REQUIREMENT_ID)
    }

    await this.requirementRepository.update(
      { REQUIREMENT_ID },
      {
        ...rest,
        IS_REQUIRED:
          rest.IS_REQUIRED !== undefined
            ? rest.IS_REQUIRED
            : existing.IS_REQUIRED,
      }
    )

    return this.success({ message: 'Requisito actualizado correctamente.' })
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
          r."REQUIREMENT_ID",
          r."REQUIREMENT_KEY",
          r."NAME",
          r."DESCRIPTION",
          r."IS_REQUIRED",
          r."STATE",
          r."CREATED_AT",
          (
            r."REQUIREMENT_KEY" || ' ' ||
            r."NAME" || ' ' ||
            COALESCE(r."DESCRIPTION", '')
          ) AS "FILTER"
        FROM PUBLIC."REQUIREMENT" r
      ) AS requirements_subquery
      ${whereClause}
      ORDER BY "REQUIREMENT_ID"
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
        summary_subquery."STATE",
        COUNT(*)::INTEGER AS "COUNT"
      FROM (${statement}) AS summary_subquery
      GROUP BY summary_subquery."STATE"
    `

    const summaryRows = await this.dataSource.query(summaryStatement, values)
    const summary = summaryRows.reduce((acc, { STATE, COUNT }) => {
      acc[STATE] = COUNT
      return acc
    }, {})

    return this.success({ data, metadata: { ...metadata, summary } })
  }

  @CatchServiceError()
  async get_requirement(requirementId: number): Promise<ApiResponse> {
    const requirement = await this.requirementRepository.findOne({
      where: { REQUIREMENT_ID: requirementId },
    })

    if (!requirement) {
      throw new NotFoundError(
        `El requisito con id '${requirementId}' no existe.`
      )
    }

    return this.success({ data: requirement })
  }

  private async ensureUniqueKey(key: string, excludeId?: number) {
    const existing = await this.requirementRepository.findOne({
      where: { REQUIREMENT_KEY: key },
    })

    if (existing && existing.REQUIREMENT_ID !== excludeId) {
      throw new DbConflictError(
        `El requisito '${key}' ya está registrado.`
      )
    }
  }

  private async createStudentRequirementRecords(
    requirementId: number,
    userId?: number
  ) {
    const students = await this.studentRepository.find({
      select: ['STUDENT_ID'],
    })

    if (!students.length) {
      return
    }

    const values = students.map((student) => ({
      STUDENT_ID: student.STUDENT_ID,
      REQUIREMENT_ID: requirementId,
      STATUS: 'P',
      STATE: 'A',
      CREATED_BY: userId ?? null,
    }))

    await this.studentRequirementRepository
      .createQueryBuilder()
      .insert()
      .into(StudentRequirement)
      .values(values)
      .orIgnore()
      .execute()
  }
}
