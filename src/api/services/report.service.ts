import { NotFoundError } from '@src/errors/http.error'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { ApiResponse, Pagination, SessionInfo } from '@src/types/api.types'
import { Repository } from 'typeorm'
import { Student } from '@src/entity/Student'
import { BaseService, CatchServiceError } from './base.service'

type ReportKey =
  | 'REQUEST_STATUS_SUMMARY'
  | 'DOCUMENT_COMPLETENESS'
  | 'DISBURSEMENT_EXECUTION'

type ReportFilterType = 'text' | 'date' | 'select'

interface ReportFilterOption {
  label: string
  value: string
}

interface ReportFilterDefinition {
  key: string
  label: string
  type: ReportFilterType
  multiple?: boolean
  options?: ReportFilterOption[]
}

interface ReportDefinition {
  KEY: ReportKey
  NAME: string
  DESCRIPTION: string
  MODULE: string
  FILTERS: ReportFilterDefinition[]
}

interface ReportRunPayload {
  filters?: Record<string, unknown>
}

interface ReportExportPayload extends ReportRunPayload {
  format?: 'csv' | 'xlsx' | 'pdf' | 'json'
}

interface Scope {
  personId?: number
  studentId?: number
}

interface QueryConfig {
  statement: string
  values: unknown[]
  summaryStatement?: string
  summaryValues?: unknown[]
}

interface RequestStatusSummaryRow {
  STATUS: string
  COUNT: number
}

interface DocumentCompletenessSummaryRow {
  TOTAL_STUDENTS: number
  COMPLETE_STUDENTS: number
  INCOMPLETE_STUDENTS: number
  AVG_COMPLETENESS: number
}

interface DisbursementSummaryRow {
  ROWS: number
  TOTAL_BUDGET: number
  TOTAL_DISBURSED: number
  TOTAL_VARIANCE: number
}

const REPORT_CATALOG: ReportDefinition[] = [
  {
    KEY: 'REQUEST_STATUS_SUMMARY',
    NAME: 'Solicitudes por estado',
    DESCRIPTION:
      'Detalle de solicitudes con resumen por estado y filtros de período.',
    MODULE: 'Solicitudes',
    FILTERS: [
      { key: 'DATE_FROM', label: 'Fecha desde', type: 'date' },
      { key: 'DATE_TO', label: 'Fecha hasta', type: 'date' },
      {
        key: 'STATUS',
        label: 'Estado',
        type: 'select',
        multiple: true,
        options: [
          { label: 'Pendiente', value: 'P' },
          { label: 'En revisión', value: 'R' },
          { label: 'Aprobada', value: 'A' },
          { label: 'Rechazada', value: 'D' },
          { label: 'Cita programada', value: 'C' },
        ],
      },
      { key: 'REQUEST_TYPE', label: 'Tipo de solicitud', type: 'text' },
      { key: 'UNIVERSITY', label: 'Universidad', type: 'text' },
      { key: 'COHORT', label: 'Cohorte', type: 'text' },
    ],
  },
  {
    KEY: 'DOCUMENT_COMPLETENESS',
    NAME: 'Completitud documental',
    DESCRIPTION:
      'Nivel de cumplimiento de documentos requeridos por estudiante.',
    MODULE: 'Documentación',
    FILTERS: [
      { key: 'UNIVERSITY', label: 'Universidad', type: 'text' },
      { key: 'COHORT', label: 'Cohorte', type: 'text' },
    ],
  },
  {
    KEY: 'DISBURSEMENT_EXECUTION',
    NAME: 'Ejecución de desembolsos',
    DESCRIPTION:
      'Comparativo entre presupuesto de becas y monto desembolsado por período.',
    MODULE: 'Finanzas',
    FILTERS: [
      { key: 'DATE_FROM', label: 'Fecha desde', type: 'date' },
      { key: 'DATE_TO', label: 'Fecha hasta', type: 'date' },
      { key: 'PERIOD', label: 'Período (YYYY-MM)', type: 'text' },
      { key: 'UNIVERSITY', label: 'Universidad', type: 'text' },
      { key: 'COHORT', label: 'Cohorte', type: 'text' },
    ],
  },
]

export class ReportService extends BaseService {
  private studentRepository: Repository<Student>
  private readonly STUDENT_ROLE_ID = 3

  constructor() {
    super()
    this.studentRepository = this.dataSource.getRepository(Student)
  }

  @CatchServiceError()
  async get_catalog(): Promise<ApiResponse<ReportDefinition[]>> {
    return this.success({ data: REPORT_CATALOG })
  }

  @CatchServiceError()
  async run_report(
    key: string,
    payload: ReportRunPayload,
    pagination: Pagination,
    session?: SessionInfo
  ): Promise<ApiResponse> {
    const report = this.findReport(key)
    const scope = await this.getScope(session)
    const config = this.buildReportQuery(report.KEY, payload?.filters ?? {}, scope)

    const [data, metadata] = await paginatedQuery({
      statement: config.statement,
      values: config.values,
      pagination,
    })

    const summaryRows = config.summaryStatement
      ? await queryRunner(
          config.summaryStatement,
          config.summaryValues ?? config.values
        )
      : []

    const summary = this.mapSummaryByReport(report.KEY, summaryRows)
    const metadataWithSummary = {
      ...metadata,
      summary,
      report: {
        key: report.KEY,
        name: report.NAME,
      },
    }

    return this.success({ data, metadata: metadataWithSummary })
  }

  @CatchServiceError()
  async export_report(
    key: string,
    payload: ReportExportPayload,
    session?: SessionInfo
  ): Promise<ApiResponse> {
    const report = this.findReport(key)
    const scope = await this.getScope(session)
    const config = this.buildReportQuery(report.KEY, payload?.filters ?? {}, scope)
    const rows = await queryRunner(config.statement, config.values)

    const summaryRows = config.summaryStatement
      ? await queryRunner(
          config.summaryStatement,
          config.summaryValues ?? config.values
        )
      : []

    const summary = this.mapSummaryByReport(report.KEY, summaryRows)
    const generatedAt = new Date().toISOString()
    const baseFileName = `${report.KEY.toLowerCase()}_${generatedAt.slice(0, 10)}`

    return this.success({
      data: {
        report,
        format: payload?.format ?? 'xlsx',
        rows,
        summary,
        generatedAt,
        fileName: baseFileName,
      },
    })
  }

  private findReport(key: string): ReportDefinition {
    const report = REPORT_CATALOG.find((item) => item.KEY === key)

    if (!report) {
      throw new NotFoundError(`Reporte '${key}' no encontrado.`)
    }

    return report
  }

  private buildReportQuery(
    key: ReportKey,
    filters: Record<string, unknown>,
    scope: Scope
  ): QueryConfig {
    switch (key) {
      case 'REQUEST_STATUS_SUMMARY':
        return this.buildRequestStatusQuery(filters, scope)
      case 'DOCUMENT_COMPLETENESS':
        return this.buildDocumentCompletenessQuery(filters, scope)
      case 'DISBURSEMENT_EXECUTION':
        return this.buildDisbursementExecutionQuery(filters, scope)
      default:
        throw new NotFoundError(`Reporte '${key}' no encontrado.`)
    }
  }

  private buildRequestStatusQuery(
    filters: Record<string, unknown>,
    scope: Scope
  ): QueryConfig {
    const values: unknown[] = []
    const where: string[] = [`r."STATE" = 'A'`, `p."STATE" = 'A'`]
    const add = (value: unknown) => {
      values.push(value)
      return `$${values.length}`
    }

    const dateFrom = this.toString(filters.DATE_FROM)
    const dateTo = this.toString(filters.DATE_TO)
    const requestType = this.toString(filters.REQUEST_TYPE)
    const university = this.toString(filters.UNIVERSITY)
    const cohort = this.toString(filters.COHORT)
    const statuses = this.toStringArray(filters.STATUS)

    if (dateFrom) {
      const placeholder = add(dateFrom)
      where.push(`r."CREATED_AT"::date >= ${placeholder}::date`)
    }

    if (dateTo) {
      const placeholder = add(dateTo)
      where.push(`r."CREATED_AT"::date <= ${placeholder}::date`)
    }

    if (statuses.length) {
      const placeholder = add(statuses)
      where.push(`r."STATUS"::text = ANY(${placeholder}::text[])`)
    }

    if (requestType) {
      const placeholder = add(`%${requestType}%`)
      where.push(`r."REQUEST_TYPE" ILIKE ${placeholder}`)
    }

    if (university) {
      const placeholder = add(`%${university}%`)
      where.push(`COALESCE(s."UNIVERSITY", '') ILIKE ${placeholder}`)
    }

    if (cohort) {
      const placeholder = add(`%${cohort}%`)
      where.push(`COALESCE(r."COHORT", '') ILIKE ${placeholder}`)
    }

    if (scope.personId) {
      const placeholder = add(scope.personId)
      where.push(`r."PERSON_ID" = ${placeholder}`)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const baseStatement = `
      SELECT
        r."REQUEST_ID",
        r."CREATED_AT",
        r."REQUEST_TYPE",
        r."STATUS",
        r."COHORT",
        p."NAME",
        p."LAST_NAME",
        p."IDENTITY_DOCUMENT",
        COALESCE(s."UNIVERSITY", '') AS "UNIVERSITY",
        COALESCE(s."CAREER", '') AS "CAREER",
        (
          p."NAME" || ' ' || COALESCE(p."LAST_NAME", '') || ' ' ||
          COALESCE(p."IDENTITY_DOCUMENT", '') || ' ' ||
          COALESCE(s."UNIVERSITY", '') || ' ' ||
          COALESCE(s."CAREER", '') || ' ' ||
          COALESCE(r."REQUEST_TYPE", '')
        ) AS "FILTER"
      FROM PUBLIC."REQUEST" r
      INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = r."PERSON_ID"
      LEFT JOIN PUBLIC."STUDENT" s ON s."STUDENT_ID" = r."STUDENT_ID"
      ${whereClause}
    `

    return {
      statement: `
        ${baseStatement}
        ORDER BY "CREATED_AT" DESC, "REQUEST_ID" DESC
      `,
      values,
      summaryStatement: `
        SELECT
          report."STATUS",
          COUNT(*)::INTEGER AS "COUNT"
        FROM (${baseStatement}) AS report
        GROUP BY report."STATUS"
      `,
      summaryValues: values,
    }
  }

  private buildDocumentCompletenessQuery(
    filters: Record<string, unknown>,
    scope: Scope
  ): QueryConfig {
    const values: unknown[] = []
    const where: string[] = [`s."STATE" = 'A'`, `p."STATE" = 'A'`]
    const add = (value: unknown) => {
      values.push(value)
      return `$${values.length}`
    }

    const university = this.toString(filters.UNIVERSITY)
    const cohort = this.toString(filters.COHORT)

    if (university) {
      const placeholder = add(`%${university}%`)
      where.push(`COALESCE(s."UNIVERSITY", '') ILIKE ${placeholder}`)
    }

    if (cohort) {
      const placeholder = add(`%${cohort}%`)
      where.push(`COALESCE(s."COHORT", '') ILIKE ${placeholder}`)
    }

    if (scope.studentId) {
      const placeholder = add(scope.studentId)
      where.push(`s."STUDENT_ID" = ${placeholder}`)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const baseStatement = `
      SELECT
        s."STUDENT_ID",
        p."NAME",
        p."LAST_NAME",
        p."IDENTITY_DOCUMENT",
        s."UNIVERSITY",
        s."CAREER",
        s."COHORT",
        required_docs."REQUIRED_COUNT" AS "REQUIRED_DOCS",
        COALESCE(uploaded_docs."UPLOADED_REQUIRED", 0) AS "UPLOADED_DOCS",
        GREATEST(
          required_docs."REQUIRED_COUNT" - COALESCE(uploaded_docs."UPLOADED_REQUIRED", 0),
          0
        ) AS "MISSING_DOCS",
        CASE
          WHEN required_docs."REQUIRED_COUNT" > 0
            THEN ROUND(
              (COALESCE(uploaded_docs."UPLOADED_REQUIRED", 0)::numeric * 100) /
              required_docs."REQUIRED_COUNT"::numeric,
              2
            )
          ELSE 0
        END AS "COMPLETENESS_PCT",
        (
          p."NAME" || ' ' || COALESCE(p."LAST_NAME", '') || ' ' ||
          COALESCE(p."IDENTITY_DOCUMENT", '') || ' ' ||
          COALESCE(s."UNIVERSITY", '') || ' ' ||
          COALESCE(s."CAREER", '')
        ) AS "FILTER"
      FROM PUBLIC."STUDENT" s
      INNER JOIN PUBLIC."PERSON" p ON p."PERSON_ID" = s."PERSON_ID"
      CROSS JOIN (
        SELECT COUNT(*)::INTEGER AS "REQUIRED_COUNT"
        FROM PUBLIC."REQUIREMENT" r
        WHERE r."STATE" = 'A' AND r."IS_REQUIRED" = TRUE
      ) required_docs
      LEFT JOIN (
        SELECT
          d."STUDENT_ID",
          COUNT(DISTINCT r."REQUIREMENT_ID")::INTEGER AS "UPLOADED_REQUIRED"
        FROM PUBLIC."STUDENT_DOCUMENT" d
        INNER JOIN PUBLIC."REQUIREMENT" r
          ON (
            LOWER(r."REQUIREMENT_KEY") = LOWER(d."DOCUMENT_TYPE")
            OR LOWER(r."NAME") = LOWER(d."DOCUMENT_TYPE")
          )
        WHERE d."STATE" = 'A'
          AND r."STATE" = 'A'
          AND r."IS_REQUIRED" = TRUE
        GROUP BY d."STUDENT_ID"
      ) uploaded_docs
        ON uploaded_docs."STUDENT_ID" = s."STUDENT_ID"
      ${whereClause}
    `

    return {
      statement: `
        ${baseStatement}
        ORDER BY "COMPLETENESS_PCT" ASC, "STUDENT_ID" DESC
      `,
      values,
      summaryStatement: `
        SELECT
          COUNT(*)::INTEGER AS "TOTAL_STUDENTS",
          SUM(CASE WHEN report."MISSING_DOCS" = 0 THEN 1 ELSE 0 END)::INTEGER AS "COMPLETE_STUDENTS",
          SUM(CASE WHEN report."MISSING_DOCS" > 0 THEN 1 ELSE 0 END)::INTEGER AS "INCOMPLETE_STUDENTS",
          COALESCE(ROUND(AVG(report."COMPLETENESS_PCT")::numeric, 2), 0) AS "AVG_COMPLETENESS"
        FROM (${baseStatement}) AS report
      `,
      summaryValues: values,
    }
  }

  private buildDisbursementExecutionQuery(
    filters: Record<string, unknown>,
    scope: Scope
  ): QueryConfig {
    const values: unknown[] = []
    const budgetWhere: string[] = [
      `sch."STATE" = 'A'`,
      `st_budget."STATE" = 'A'`,
      `person_budget."STATE" = 'A'`,
    ]
    const disbursementWhere: string[] = [
      `d."STATE" = 'A'`,
      `sch_d."STATE" = 'A'`,
      `st_disb."STATE" = 'A'`,
      `person_disb."STATE" = 'A'`,
    ]

    const add = (value: unknown) => {
      values.push(value)
      return `$${values.length}`
    }

    const dateFrom = this.toString(filters.DATE_FROM)
    const dateTo = this.toString(filters.DATE_TO)
    const period = this.toString(filters.PERIOD)
    const university = this.toString(filters.UNIVERSITY)
    const cohort = this.toString(filters.COHORT)

    if (dateFrom) {
      const budgetPlaceholder = add(dateFrom)
      budgetWhere.push(`sch."START_DATE" >= ${budgetPlaceholder}::date`)
      const disbursementPlaceholder = add(dateFrom)
      disbursementWhere.push(
        `d."DISBURSEMENT_DATE" >= ${disbursementPlaceholder}::date`
      )
    }

    if (dateTo) {
      const budgetPlaceholder = add(dateTo)
      budgetWhere.push(`sch."START_DATE" <= ${budgetPlaceholder}::date`)
      const disbursementPlaceholder = add(dateTo)
      disbursementWhere.push(
        `d."DISBURSEMENT_DATE" <= ${disbursementPlaceholder}::date`
      )
    }

    if (period) {
      const budgetPlaceholder = add(period)
      budgetWhere.push(
        `to_char(sch."START_DATE", 'YYYY-MM') = ${budgetPlaceholder}`
      )
      const disbursementPlaceholder = add(period)
      disbursementWhere.push(
        `to_char(d."DISBURSEMENT_DATE", 'YYYY-MM') = ${disbursementPlaceholder}`
      )
    }

    if (university) {
      const budgetPlaceholder = add(`%${university}%`)
      budgetWhere.push(`COALESCE(st_budget."UNIVERSITY", '') ILIKE ${budgetPlaceholder}`)
      const disbursementPlaceholder = add(`%${university}%`)
      disbursementWhere.push(
        `COALESCE(st_disb."UNIVERSITY", '') ILIKE ${disbursementPlaceholder}`
      )
    }

    if (cohort) {
      const budgetPlaceholder = add(`%${cohort}%`)
      budgetWhere.push(`COALESCE(st_budget."COHORT", '') ILIKE ${budgetPlaceholder}`)
      const disbursementPlaceholder = add(`%${cohort}%`)
      disbursementWhere.push(`COALESCE(st_disb."COHORT", '') ILIKE ${disbursementPlaceholder}`)
    }

    if (scope.studentId) {
      const budgetPlaceholder = add(scope.studentId)
      budgetWhere.push(`sch."STUDENT_ID" = ${budgetPlaceholder}`)
      const disbursementPlaceholder = add(scope.studentId)
      disbursementWhere.push(`sch_d."STUDENT_ID" = ${disbursementPlaceholder}`)
    }

    const budgetWhereClause = budgetWhere.length
      ? `WHERE ${budgetWhere.join(' AND ')}`
      : ''
    const disbursementWhereClause = disbursementWhere.length
      ? `WHERE ${disbursementWhere.join(' AND ')}`
      : ''

    const baseStatement = `
      WITH budget AS (
        SELECT
          to_char(sch."START_DATE", 'YYYY-MM') AS "PERIOD",
          COALESCE(st_budget."UNIVERSITY", 'Sin asignar') AS "UNIVERSITY",
          SUM(sch."AMOUNT")::numeric(14,2) AS "BUDGET_AMOUNT"
        FROM PUBLIC."SCHOLARSHIP" sch
        INNER JOIN PUBLIC."STUDENT" st_budget
          ON st_budget."STUDENT_ID" = sch."STUDENT_ID"
        INNER JOIN PUBLIC."PERSON" person_budget
          ON person_budget."PERSON_ID" = st_budget."PERSON_ID"
        ${budgetWhereClause}
        GROUP BY 1, 2
      ),
      disbursement AS (
        SELECT
          to_char(d."DISBURSEMENT_DATE", 'YYYY-MM') AS "PERIOD",
          COALESCE(st_disb."UNIVERSITY", 'Sin asignar') AS "UNIVERSITY",
          COUNT(*)::INTEGER AS "DISBURSEMENT_COUNT",
          SUM(d."AMOUNT")::numeric(14,2) AS "DISBURSED_AMOUNT"
        FROM PUBLIC."DISBURSEMENT" d
        INNER JOIN PUBLIC."SCHOLARSHIP" sch_d
          ON sch_d."SCHOLARSHIP_ID" = d."SCHOLARSHIP_ID"
        INNER JOIN PUBLIC."STUDENT" st_disb
          ON st_disb."STUDENT_ID" = sch_d."STUDENT_ID"
        INNER JOIN PUBLIC."PERSON" person_disb
          ON person_disb."PERSON_ID" = st_disb."PERSON_ID"
        ${disbursementWhereClause}
        GROUP BY 1, 2
      )
      SELECT
        COALESCE(budget."PERIOD", disbursement."PERIOD") AS "PERIOD",
        COALESCE(budget."UNIVERSITY", disbursement."UNIVERSITY") AS "UNIVERSITY",
        COALESCE(budget."BUDGET_AMOUNT", 0)::numeric(14,2) AS "BUDGET_AMOUNT",
        COALESCE(disbursement."DISBURSED_AMOUNT", 0)::numeric(14,2) AS "DISBURSED_AMOUNT",
        COALESCE(disbursement."DISBURSEMENT_COUNT", 0)::INTEGER AS "DISBURSEMENT_COUNT",
        (
          COALESCE(disbursement."DISBURSED_AMOUNT", 0) -
          COALESCE(budget."BUDGET_AMOUNT", 0)
        )::numeric(14,2) AS "VARIANCE_AMOUNT",
        CASE
          WHEN COALESCE(budget."BUDGET_AMOUNT", 0) > 0 THEN
            ROUND(
              (
                COALESCE(disbursement."DISBURSED_AMOUNT", 0) * 100::numeric
              ) / budget."BUDGET_AMOUNT",
              2
            )
          ELSE 0
        END AS "EXECUTION_PCT",
        (
          COALESCE(budget."UNIVERSITY", disbursement."UNIVERSITY") || ' ' ||
          COALESCE(budget."PERIOD", disbursement."PERIOD")
        ) AS "FILTER"
      FROM budget
      FULL OUTER JOIN disbursement
        ON budget."PERIOD" = disbursement."PERIOD"
       AND budget."UNIVERSITY" = disbursement."UNIVERSITY"
    `

    return {
      statement: `
        ${baseStatement}
        ORDER BY "PERIOD" DESC, "UNIVERSITY" ASC
      `,
      values,
      summaryStatement: `
        SELECT
          COUNT(*)::INTEGER AS "ROWS",
          COALESCE(SUM(report."BUDGET_AMOUNT"), 0)::numeric(14,2) AS "TOTAL_BUDGET",
          COALESCE(SUM(report."DISBURSED_AMOUNT"), 0)::numeric(14,2) AS "TOTAL_DISBURSED",
          COALESCE(SUM(report."VARIANCE_AMOUNT"), 0)::numeric(14,2) AS "TOTAL_VARIANCE"
        FROM (${baseStatement}) AS report
      `,
      summaryValues: values,
    }
  }

  private mapSummaryByReport(
    key: ReportKey,
    summaryRows: unknown[]
  ): Record<string, number> {
    if (key === 'REQUEST_STATUS_SUMMARY') {
      const rows = (summaryRows || []) as RequestStatusSummaryRow[]
      const summary: Record<string, number> = {
        P: 0,
        R: 0,
        A: 0,
        D: 0,
        C: 0,
        TOTAL: 0,
      }

      rows.forEach(({ STATUS, COUNT }) => {
        if (typeof summary[STATUS] === 'number') {
          summary[STATUS] = Number(COUNT || 0)
        }
      })

      summary.TOTAL = summary.P + summary.R + summary.A + summary.D + summary.C
      return summary
    }

    if (key === 'DOCUMENT_COMPLETENESS') {
      const [row] = (summaryRows || []) as DocumentCompletenessSummaryRow[]
      return {
        TOTAL_STUDENTS: Number(row?.TOTAL_STUDENTS ?? 0),
        COMPLETE_STUDENTS: Number(row?.COMPLETE_STUDENTS ?? 0),
        INCOMPLETE_STUDENTS: Number(row?.INCOMPLETE_STUDENTS ?? 0),
        AVG_COMPLETENESS: Number(row?.AVG_COMPLETENESS ?? 0),
      }
    }

    const [row] = (summaryRows || []) as DisbursementSummaryRow[]
    return {
      ROWS: Number(row?.ROWS ?? 0),
      TOTAL_BUDGET: Number(row?.TOTAL_BUDGET ?? 0),
      TOTAL_DISBURSED: Number(row?.TOTAL_DISBURSED ?? 0),
      TOTAL_VARIANCE: Number(row?.TOTAL_VARIANCE ?? 0),
    }
  }

  private toString(value: unknown): string {
    if (value === null || value === undefined) {
      return ''
    }

    const parsed = String(value).trim()
    return parsed
  }

  private toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map((item) => String(item).trim())
        .filter((item) => Boolean(item))
    }

    const single = this.toString(value)
    return single ? [single] : []
  }

  private async getScope(session?: SessionInfo): Promise<Scope> {
    if (!session?.userId) {
      return {}
    }

    const isStudent = await this.userRolesRepository.findOne({
      where: { USER_ID: session.userId, ROLE_ID: this.STUDENT_ROLE_ID },
    })

    if (!isStudent) {
      return {}
    }

    const user = await this.userRepository.findOne({
      where: { USER_ID: session.userId },
    })

    if (!user?.PERSON_ID) {
      return {}
    }

    const student = await this.studentRepository.findOne({
      where: { PERSON_ID: user.PERSON_ID },
    })

    return {
      personId: user.PERSON_ID,
      studentId: student?.STUDENT_ID,
    }
  }
}
