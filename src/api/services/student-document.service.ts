import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { StudentDocument } from '@src/entity/StudentDocument'
import { Student } from '@src/entity/Student'
import { Requirement } from '@src/entity/Requirement'
import { StudentRequirement } from '@src/entity/StudentRequirement'
import { NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateStudentDocumentPayload {
  STUDENT_ID: number
  DOCUMENT_TYPE: string
  FILE_NAME: string
  MIME_TYPE: string
  FILE_BASE64: string
  SIGNED_BASE64?: string | null
  SIGNED_AT?: string | Date | null
  DESCRIPTION?: string | null
  STATE?: string
}

interface UpdateStudentDocumentPayload
  extends Partial<CreateStudentDocumentPayload> {
  DOCUMENT_ID: number
}

export class StudentDocumentService extends BaseService {
  private documentRepository: Repository<StudentDocument>
  private studentRepository: Repository<Student>
  private requirementRepository: Repository<Requirement>
  private studentRequirementRepository: Repository<StudentRequirement>

  constructor() {
    super()
    this.documentRepository = this.dataSource.getRepository(StudentDocument)
    this.studentRepository = this.dataSource.getRepository(Student)
    this.requirementRepository = this.dataSource.getRepository(Requirement)
    this.studentRequirementRepository =
      this.dataSource.getRepository(StudentRequirement)
  }

  @CatchServiceError()
  async create(
    payload: CreateStudentDocumentPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    await this.ensureStudent(payload.STUDENT_ID)

    const document = this.documentRepository.create({
      ...payload,
      SIGNED_BASE64: payload.SIGNED_BASE64 ?? null,
      SIGNED_AT: payload.SIGNED_AT ? new Date(payload.SIGNED_AT) : null,
      STATE: payload.STATE ?? 'A',
      CREATED_BY: session.userId,
    })

    await this.documentRepository.save(document)

    await this.markRequirementReceived(
      payload.STUDENT_ID,
      payload.DOCUMENT_TYPE
    )

    return this.success({
      message: 'Documento registrado correctamente.',
      data: document,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateStudentDocumentPayload): Promise<ApiResponse> {
    const { DOCUMENT_ID, ...rest } = payload

    const existing = await this.documentRepository.findOne({
      where: { DOCUMENT_ID },
    })

    if (!existing) {
      throw new NotFoundError(
        `El documento con id '${DOCUMENT_ID}' no existe.`
      )
    }

    if (rest.STUDENT_ID) {
      await this.ensureStudent(rest.STUDENT_ID)
    }

    await this.documentRepository.update(
      { DOCUMENT_ID },
      {
        ...rest,
        SIGNED_AT:
          rest.SIGNED_AT !== undefined
            ? rest.SIGNED_AT
              ? new Date(rest.SIGNED_AT)
              : null
            : existing.SIGNED_AT,
      }
    )

    const studentId = rest.STUDENT_ID ?? existing.STUDENT_ID
    const documentType = rest.DOCUMENT_TYPE ?? existing.DOCUMENT_TYPE

    await this.markRequirementReceived(studentId, documentType)

    return this.success({ message: 'Documento actualizado correctamente.' })
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
          d."DOCUMENT_ID",
          d."STUDENT_ID",
          d."DOCUMENT_TYPE",
          d."FILE_NAME",
          d."MIME_TYPE",
          d."SIGNED_AT",
          d."DESCRIPTION",
          d."STATE",
          d."CREATED_AT",
          s."PERSON_ID",
          p."NAME",
          p."LAST_NAME",
          p."IDENTITY_DOCUMENT",
          s."UNIVERSITY",
          s."CAREER"
        FROM PUBLIC."STUDENT_DOCUMENT" d
        INNER JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = d."STUDENT_ID"
        INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = s."PERSON_ID"
      ) AS documents_subquery
      ${whereClause}
      ORDER BY "DOCUMENT_ID" DESC
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
  async get_document(documentId: number): Promise<ApiResponse> {
    const statement = `
      SELECT
        d.*,
        s."PERSON_ID",
        p."NAME",
        p."LAST_NAME",
        p."IDENTITY_DOCUMENT",
        s."UNIVERSITY",
        s."CAREER"
      FROM PUBLIC."STUDENT_DOCUMENT" d
      INNER JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = d."STUDENT_ID"
      INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = s."PERSON_ID"
      WHERE d."DOCUMENT_ID" = $1
    `

    const [document] = await queryRunner<StudentDocument>(statement, [
      documentId,
    ])

    if (!document) {
      throw new NotFoundError(
        `El documento con id '${documentId}' no existe.`
      )
    }

    return this.success({ data: document })
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

  private async markRequirementReceived(
    studentId: number,
    documentType: string
  ) {
    if (!documentType) return

    const requirement = await this.requirementRepository.findOne({
      where: { REQUIREMENT_KEY: documentType },
    })

    if (!requirement) return

    const existing = await this.studentRequirementRepository.findOne({
      where: {
        STUDENT_ID: studentId,
        REQUIREMENT_ID: requirement.REQUIREMENT_ID,
      },
    })

    if (!existing) {
      const created = this.studentRequirementRepository.create({
        STUDENT_ID: studentId,
        REQUIREMENT_ID: requirement.REQUIREMENT_ID,
        STATUS: 'R',
        STATE: 'A',
      })
      await this.studentRequirementRepository.save(created)
      return
    }

    if (existing.STATUS === 'P') {
      await this.studentRequirementRepository.update(
        { STUDENT_REQUIREMENT_ID: existing.STUDENT_REQUIREMENT_ID },
        { STATUS: 'R' }
      )
    }
  }
}
