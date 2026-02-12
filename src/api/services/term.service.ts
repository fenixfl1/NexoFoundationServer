import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Repository } from 'typeorm'
import { Term } from '@src/entity/Term'
import { CourseGrade } from '@src/entity/CourseGrade'
import { Student } from '@src/entity/Student'
import { NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CoursePayload {
  COURSE_NAME: string
  GRADE: number
  CREDITS: number
  STATUS?: CourseGrade['STATUS']
}

interface CreateTermPayload {
  STUDENT_ID: number
  PERIOD: string
  OBSERVATIONS?: string | null
  CAPTURE_FILE_NAME?: string | null
  CAPTURE_MIME_TYPE?: string | null
  CAPTURE_BASE64?: string | null
  COURSES: CoursePayload[]
}

interface UpdateTermPayload extends Partial<CreateTermPayload> {
  TERM_ID: number
}

export class TermService extends BaseService {
  private termRepository: Repository<Term>
  private courseRepository: Repository<CourseGrade>
  private studentRepository: Repository<Student>

  constructor() {
    super()
    this.termRepository = this.dataSource.getRepository(Term)
    this.courseRepository = this.dataSource.getRepository(CourseGrade)
    this.studentRepository = this.dataSource.getRepository(Student)
  }

  @CatchServiceError()
  async create(
    payload: CreateTermPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const studentId =
      payload.STUDENT_ID ?? (await this.resolveStudentIdFromSession(session))

    await this.ensureStudent(studentId)

    const { termIndex, totalCredits } = this.calculateIndex(payload.COURSES)

    const term = this.termRepository.create({
      ...payload,
      STUDENT_ID: studentId,
      TERM_INDEX: termIndex,
      TOTAL_CREDITS: totalCredits,
      CREATED_BY: session.userId,
    })

    term.COURSES = payload.COURSES.map((course) =>
      this.courseRepository.create({
        ...course,
        CREATED_BY: session.userId,
      })
    )

    await this.termRepository.save(term)
    await this.recalculateStudentAverage(studentId)

    return this.success({
      message: 'Registro de cuatrimestre guardado.',
      data: term,
    })
  }

  @CatchServiceError()
  async update(payload: UpdateTermPayload): Promise<ApiResponse> {
    const { TERM_ID, COURSES, ...rest } = payload

    const term = await this.termRepository.findOne({
      where: { TERM_ID },
      relations: ['COURSES'],
    })

    if (!term) {
      throw new NotFoundError(
        `El cuatrimestre con id '${TERM_ID}' no fue encontrado.`
      )
    }

    const nextCourses = COURSES ?? term.COURSES
    const { termIndex, totalCredits } = this.calculateIndex(nextCourses)

    await this.termRepository.update(
      { TERM_ID },
      {
        ...rest,
        TERM_INDEX: termIndex,
        TOTAL_CREDITS: totalCredits,
      }
    )

    if (COURSES) {
      await this.courseRepository.delete({ TERM_ID })
      const courseEntities = COURSES.map((course) =>
        this.courseRepository.create({
          ...course,
          TERM_ID,
        })
      )
      await this.courseRepository.save(courseEntities)
    }

    await this.recalculateStudentAverage(term.STUDENT_ID)

    return this.success({ message: 'Cuatrimestre actualizado.' })
  }

  @CatchServiceError()
  async get_term(termId: number): Promise<ApiResponse> {
    const term = await this.termRepository.findOne({
      where: { TERM_ID: termId },
      relations: ['COURSES', 'STUDENT'],
    })

    if (!term) {
      throw new NotFoundError(
        `El cuatrimestre con id '${termId}' no fue encontrado.`
      )
    }

    return this.success({ data: term })
  }

  @CatchServiceError()
  async get_by_student(studentId: number): Promise<ApiResponse> {
    const terms = await this.termRepository.find({
      where: { STUDENT_ID: studentId },
      relations: ['COURSES'],
      order: { CREATED_AT: 'DESC' },
    })

    if (!terms.length) {
      return this.noContent()
    }

    return this.success({ data: terms })
  }

  @CatchServiceError()
  async get_pagination(
    payload: AdvancedCondition[],
    pagination: Pagination
  ): Promise<ApiResponse> {
    const { values, whereClause } = whereClauseBuilder(payload)

    const statement = `
      SELECT
        t."TERM_ID",
        t."STUDENT_ID",
        t."PERIOD",
        t."TERM_INDEX",
        t."TOTAL_CREDITS",
        t."OBSERVATIONS",
        t."CAPTURE_FILE_NAME",
        t."CAPTURE_MIME_TYPE",
        p."NAME",
        p."LAST_NAME",
        p."IDENTITY_DOCUMENT",
        s."UNIVERSITY",
        s."CAREER",
        (
          p."NAME" || ' ' ||
          p."LAST_NAME" || ' ' ||
          p."IDENTITY_DOCUMENT" || ' ' ||
          COALESCE(t."PERIOD", '')
        ) AS "FILTER"
      FROM PUBLIC."TERM" t
      INNER JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = t."STUDENT_ID"
      INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = s."PERSON_ID"
      ${whereClause}
      ORDER BY t."CREATED_AT" DESC, t."TERM_ID" DESC
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

  private calculateIndex(courses: CoursePayload[]) {
    const totals = courses.reduce(
      (acc, course) => {
        const credits = Number(course.CREDITS) || 0
        const grade = Number(course.GRADE) || 0
        acc.credits += credits
        acc.weighted += grade * credits
        return acc
      },
      { credits: 0, weighted: 0 }
    )

    const termIndex =
      totals.credits > 0
        ? Number((totals.weighted / totals.credits).toFixed(2))
        : 0

    return { termIndex, totalCredits: totals.credits }
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

  private async recalculateStudentAverage(studentId: number) {
    const statement = `
      SELECT
        SUM(t."TERM_INDEX" * t."TOTAL_CREDITS") AS weighted,
        SUM(t."TOTAL_CREDITS") AS credits
      FROM PUBLIC."TERM" t
      WHERE t."STUDENT_ID" = $1
    `

    const [result] = await queryRunner<{ weighted: string; credits: string }>(
      statement,
      [studentId]
    )

    const weighted = Number(result?.weighted ?? 0)
    const credits = Number(result?.credits ?? 0)
    const academicAverage =
      credits > 0 ? Number((weighted / credits).toFixed(2)) : 0

    await this.studentRepository.update(
      { STUDENT_ID: studentId },
      { ACADEMIC_AVERAGE: academicAverage }
    )
  }

  private async resolveStudentIdFromSession(
    session: SessionInfo
  ): Promise<number> {
    if (!session?.userId) {
      throw new NotFoundError(
        'No se pudo determinar el becario de la sesión actual.'
      )
    }

    const person = await this.personRepository.findOne({
      relations: ['USER'],
      where: { USER: { USER_ID: session.userId } },
    })

    if (!person?.PERSON_ID) {
      throw new NotFoundError(
        'No se encontró la persona asociada a la sesión.'
      )
    }

    const student = await this.studentRepository.findOne({
      where: { PERSON_ID: person.PERSON_ID },
    })

    if (!student?.STUDENT_ID) {
      throw new NotFoundError(
        'No se encontró el becario asociado a la sesión.'
      )
    }

    return student.STUDENT_ID
  }
}
