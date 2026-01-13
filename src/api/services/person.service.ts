import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Contact, ContactType, ContactUsage } from '@src/entity/Contact'
import { Reference } from '@src/entity/Reference'
import { Student } from '@src/entity/Student'
import { EntityManager, Repository } from 'typeorm'
import { generatePassword } from '@src/helpers/generate-password'
import { publishEmailToQueue } from './email/email-producer.service'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'
import { UserRoles } from '@src/entity/RolesUser'
import { queryBuilder } from '../../helpers/query-builder'
import { NotFoundError } from '@src/errors/http.error'
import { Person } from '@src/entity/Person'

interface StudentPayload {
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

interface CreatePersonPayload {
  PASSWORD: string
  USERNAME: string
  NAME: string
  LAST_NAME: string
  GENDER: string
  BIRTH_DATE: string
  IDENTITY_DOCUMENT: string
  ROLE_ID: number
  REFERENCES: ReferencePayload[]
  CONTACTS: {
    TYPE: ContactType
    USAGE: ContactUsage
    VALUE: string
    IS_PRIMARY: boolean
  }[]
  STUDENT?: StudentPayload
}

interface UpdatePersonPayload
  extends Omit<Person, 'CONTACTS' | 'REFERENCES' | 'USER'> {
  ROLE_ID: number
}

interface ReferencePayload {
  FULL_NAME: string
  RELATIONSHIP: string
  PHONE: string
  EMAIL?: string
  ADDRESS?: string
  NOTES?: string
}

interface ReferenceUpdatePayload extends Partial<ReferencePayload> {
  REFERENCE_ID: number
  PERSON_ID?: number
}

const STUDENT_ROLE_ID = 3

export class PersonService extends BaseService {
  private referenceRepository: Repository<Reference>
  private contactRepository: Repository<Contact>
  private userRoleRepository: Repository<UserRoles>
  private studentRepository: Repository<Student>

  constructor() {
    super()
    this.contactRepository = this.dataSource.getRepository(Contact)
    this.referenceRepository = this.dataSource.getRepository(Reference)
    this.userRoleRepository = this.dataSource.getRepository(UserRoles)
    this.studentRepository = this.dataSource.getRepository(Student)
  }

  @CatchServiceError()
  async create(
    payload: CreatePersonPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    return this.dataSource.transaction(async (manager) => {
      const {
        USERNAME,
        PASSWORD,
        ROLE_ID,
        REFERENCES = [],
        CONTACTS,
        STUDENT,
        ...resProps
      } = payload
      const contacts: Contact[] = []

      const common = {
        STATE: 'A',
        CREATED_AT: new Date(),
        CREATED_BY: session?.userId,
      }

      const personData = this.personRepository.create({
        ...common,
        ...resProps,
      })

      const person = await manager.save(personData)

      const student =
        ROLE_ID === STUDENT_ROLE_ID && STUDENT
          ? this.studentRepository.create({
              PERSON: person,
              PERSON_ID: person.PERSON_ID,
              ...common,
              ...STUDENT,
            })
          : undefined

      if (CONTACTS?.length) {
        for (const contact of CONTACTS) {
          contacts.push(
            this.contactRepository.create({
              PERSON: person,
              PERSON_ID: person.PERSON_ID,
              ...common,
              ...contact,
            })
          )
        }
      }

      await this.createReferences(
        manager,
        person,
        REFERENCES,
        common.CREATED_BY
      )
      await manager.save(contacts)
      if (student) {
        await manager.save(student)
      }

      if (USERNAME) {
        const { password, hash } = await generatePassword(PASSWORD)

        const user = this.userRepository.create({
          ...common,
          PERSON_ID: person.PERSON_ID,
          USERNAME,
          PASSWORD: hash,
        })

        const defaultMail = contacts.find(
          (item) => item.IS_PRIMARY && item.TYPE === ContactType.EMAIL
        ).VALUE

        await manager.save(user)

        if (ROLE_ID) {
          const userRole = this.userRoleRepository.create({
            ROLE_ID,
            USER: user,
            ...common,
          })

          manager.save(userRole)
        }

        if (defaultMail) {
          await publishEmailToQueue({
            to: defaultMail,
            subject: 'Te damos la bienvenida',
            templateName: 'welcome',
            record: {
              ...person,
              USERNAME,
              password,
              url: process.env.ADMIN_APP_URL,
            },
            text: '',
          })
        }
      }

      return this.success({ message: 'Persona registrado con éxito.' })
    })
  }

  @CatchServiceError()
  async update(payload: UpdatePersonPayload): Promise<ApiResponse<Person>> {
    const { PERSON_ID, ROLE_ID, ...restProps } = payload

    await this.dataSource.transaction(async (manager) => {
      const person = await this.getPerson(PERSON_ID, { USER: true })
      const user = await this.getUser(person.PERSON_ID, {
        searchKey: 'PERSON_ID',
        throwError: false,
      })

      await manager.update(Person, { PERSON_ID }, { ...restProps, ROLE_ID })

      if (ROLE_ID && person.ROLE_ID !== ROLE_ID && user) {
        const currentRole = await this.userRolesRepository.findOne({
          where: {
            USER_ID: user.USER_ID,
            ROLE_ID: person.ROLE_ID,
          },
        })

        if (currentRole) {
          await manager.update(
            UserRoles,
            {
              USER_ID: user.USER_ID,
              ROLE_ID: person.ROLE_ID,
            },
            { ROLE_ID }
          )
        } else {
          const newUserRole = this.userRolesRepository.create({
            USER_ID: user.USER_ID,
            ROLE_ID,
            STATE: 'A',
          })

          await manager.save(UserRoles, newUserRole)
        }
      }
    })

    const data = await this.get_person('PERSON_ID', PERSON_ID)

    return this.success({
      data,
      message: `Persona con id '${PERSON_ID}' actualizada exitosamente`,
    })
  }

  private async createReferences(
    manager: EntityManager,
    person: Person,
    references: ReferencePayload[] = [],
    createdBy?: number
  ): Promise<Reference[]> {
    if (!references?.length) return []

    const entities = references.map((ref) =>
      this.referenceRepository.create({
        PERSON: person,
        PERSON_ID: person.PERSON_ID,
        STATE: 'A',
        CREATED_BY: createdBy,
        ...ref,
      })
    )

    return manager.save(Reference, entities)
  }

  @CatchServiceError()
  async addReferences(
    payload: ReferencePayload & { PERSON_ID: number },
    session: SessionInfo
  ): Promise<ApiResponse<Reference[]>> {
    const { PERSON_ID } = payload
    const person = await this.getPerson(PERSON_ID)

    const created = await this.dataSource.transaction((manager) =>
      this.createReferences(manager, person, [payload], session?.userId)
    )

    return this.success({
      data: created,
      message: `Referencias agregadas a la persona ${PERSON_ID} exitosamente`,
    })
  }

  @CatchServiceError()
  async updateReference(
    payload: ReferenceUpdatePayload,
    session: SessionInfo
  ): Promise<ApiResponse<Reference>> {
    const { REFERENCE_ID, PERSON_ID, ...rest } = payload

    const reference = await this.referenceRepository.findOne({
      where: { REFERENCE_ID },
    })

    if (!reference) {
      throw new NotFoundError(
        `Referencia con id '${REFERENCE_ID}' no encontrada.`
      )
    }

    if (PERSON_ID && reference.PERSON_ID !== PERSON_ID) {
      throw new NotFoundError(
        `La referencia '${REFERENCE_ID}' no pertenece a la persona '${PERSON_ID}'.`
      )
    }

    const updateData = Object.fromEntries(
      Object.entries(rest).filter(([, value]) => value !== undefined)
    )

    await this.dataSource.transaction(async (manager) => {
      if (Object.keys(updateData).length) {
        await manager.update(Reference, { REFERENCE_ID }, updateData)
      }
    })

    const updated = await this.referenceRepository.findOne({
      where: { REFERENCE_ID },
    })

    return this.success({
      data: updated,
      message: `Referencia con id '${REFERENCE_ID}' actualizada exitosamente`,
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
      FROM
        (
          SELECT
            P.*,
            p."NAME" || ' ' || p."LAST_NAME" || ' ' || p."IDENTITY_DOCUMENT" || ' ' || u."USERNAME" || ' ' || PHONE."VALUE" || ' ' || EMAIL."VALUE" AS "FILTER",
            U."USERNAME",
            U."USER_ID",
            R."ROLE_ID",
            R."NAME" AS "ROLE_NAME",
            EMAIL."VALUE" AS "EMAIL",
            PHONE."VALUE" AS "PHONE"
          FROM
            PUBLIC."PERSON" P
            LEFT JOIN PUBLIC."USER" U ON P."PERSON_ID" = U."PERSON_ID"
            AND U."STATE" = 'A'
            LEFT JOIN PUBLIC."ROLE" R ON R."ROLE_ID" = P."ROLE_ID"
            AND R."STATE" = 'A'
            LEFT JOIN PUBLIC."CONTACT" EMAIL ON P."PERSON_ID" = EMAIL."PERSON_ID"
            AND EMAIL."IS_PRIMARY" = TRUE
            AND EMAIL."TYPE" = 'email'
            LEFT JOIN PUBLIC."CONTACT" PHONE ON P."PERSON_ID" = PHONE."PERSON_ID"
            AND PHONE."IS_PRIMARY" = TRUE
            AND PHONE."TYPE" = 'phone'
        ) AS SUBQUERY
      ${whereClause}
    `

    const [data = [], metadata] = await paginatedQuery({
      statement,
      pagination,
      values,
    })

    if (!data.length) {
      return this.success({ status: HTTP_STATUS_NO_CONTENT })
    }

    return this.success({ data, metadata })
  }

  @CatchServiceError()
  async getPersonById(personId: number): Promise<ApiResponse<Person>> {
    const data = await this.get_person('PERSON_ID', personId)

    return this.success({ data })
  }

  @CatchServiceError()
  async getPersonByUsername(username: string): Promise<ApiResponse<Person>> {
    const data = await this.get_person('USERNAME', username)

    return this.success({ data })
  }

  private async get_person(
    identifier: 'USERNAME' | 'PERSON_ID' | 'USER_ID',
    value: string | number
  ): Promise<Person> {
    const statement = `
      SELECT
        *
      FROM
        (
          SELECT
            P.*,
            U."USERNAME",
            U."AVATAR",
            U."USER_ID",
            R."NAME" AS "ROLE_NAME",
            R."ROLE_ID",
            S."STUDENT_ID",
            EMAIL."VALUE" AS "EMAIL",
            PHONE."VALUE" AS "PHONE"
          FROM
            PUBLIC."PERSON" P
            LEFT JOIN PUBLIC."USER" U ON P."PERSON_ID" = U."PERSON_ID"
            AND U."STATE" = 'A'
            LEFT JOIN PUBLIC."ROLES_X_USER" UXR ON U."USER_ID" = UXR."USER_ID"
            AND UXR."STATE" = 'A'
            LEFT JOIN PUBLIC."ROLE" R ON R."ROLE_ID" = UXR."ROLE_ID"
            AND R."STATE" = 'A'
            LEFT JOIN PUBLIC."CONTACT" EMAIL ON P."PERSON_ID" = EMAIL."PERSON_ID"
            AND EMAIL."IS_PRIMARY" = TRUE
            AND EMAIL."TYPE" = 'email'
            LEFT JOIN PUBLIC."CONTACT" PHONE ON P."PERSON_ID" = PHONE."PERSON_ID"
            AND PHONE."IS_PRIMARY" = TRUE
            AND PHONE."TYPE" = 'phone'
			      LEFT JOIN public."STUDENT" S on S."PERSON_ID" = p."PERSON_ID"
        ) AS SUBQUERY
      WHERE
        "${identifier}" = $1
    `

    const [person] = await queryRunner<Person>(statement, [value])

    if (!person) {
      throw new NotFoundError(`Persona no encontrado.`)
    }

    const references = await this.referenceRepository.find({
      where: {
        PERSON_ID: person.PERSON_ID,
      },
    })

    const contacts = await this.contactRepository.find({
      where: {
        PERSON_ID: person.PERSON_ID,
      },
    })

    const student = await this.studentRepository.findOne({
      where: {
        PERSON_ID: person.PERSON_ID,
      },
    })

    const data = {
      ...person,
      REFERENCES: references ?? [],
      CONTACTS: contacts ?? [],
      STUDENT: student ?? {},
    }

    return data
  }

  private async createReference(
    payload: Reference[],
    manager?: EntityManager
  ) {}
}
