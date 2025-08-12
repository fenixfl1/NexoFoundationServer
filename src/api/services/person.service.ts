import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { Contact, ContactType, ContactUsage } from '@src/entity/Contact'
import { Reference } from '@src/entity/Reference'
import { Repository } from 'typeorm'
import { generatePassword } from '@src/helpers/generate-password'
import { publishEmailToQueue } from './email/email-producer.service'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery, queryRunner } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'
import { UserRoles } from '@src/entity/RolesUser'
import { queryBuilder } from '../../helpers/query-builder'
import { NotFoundError } from '@src/errors/http.error'
import { Person } from '@src/entity/Person'

interface CreatePersonPayload {
  PASSWORD: string
  USERNAME: string
  NAME: string
  LAST_NAME: string
  GENDER: string
  BIRTH_DATE: string
  IDENTITY_DOCUMENT: string
  ROLE_ID: number
  REFERENCES: {
    NOMBRE: string
    RELATIONSHIP: string
    PHONE: string
    EMAIL: string
    ADDRESS: string
    NOTES: string
  }[]
  CONTACTS: {
    TYPE: ContactType
    USAGE: ContactUsage
    VALUE: string
    IS_PRIMARY: boolean
  }[]
}

export class PersonService extends BaseService {
  private referenceRepository: Repository<Reference>
  private contactRepository: Repository<Contact>
  private userRoleRepository: Repository<UserRoles>

  constructor() {
    super()
    this.contactRepository = this.dataSource.getRepository(Contact)
    this.referenceRepository = this.dataSource.getRepository(Reference)
    this.userRoleRepository = this.dataSource.getRepository(UserRoles)
  }

  @CatchServiceError()
  async create(
    payload: CreatePersonPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    return this.dataSource.transaction(async (manager) => {
      const { USERNAME, PASSWORD, ROLE_ID, REFERENCES, CONTACTS, ...resProps } =
        payload
      const references: Reference[] = []
      const contacts: Contact[] = []

      const common = {
        STATE: 'A',
        CREATE_AT: new Date(),
        CREATED_BY: session?.userId,
      }

      const personData = this.personRepository.create({
        ...common,
        ...resProps,
      })

      const person = await manager.save(personData)

      if (REFERENCES?.length) {
        for (const ref of REFERENCES) {
          references.push(
            this.referenceRepository.create({
              PERSON: person,
              PERSON_ID: person.PERSON_ID,
              ...common,
              ...ref,
            })
          )
        }
      }

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

      await manager.save(references)
      await manager.save(contacts)

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
            R."NAME" AS "ROLE_NAME",
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
  async get_person(username: string): Promise<ApiResponse> {
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
        ) AS SUBQUERY
      WHERE
        "USERNAME" = $1
    `

    const [person] = await queryRunner<Person>(statement, [username])

    if (!person) {
      throw new NotFoundError(`El usuario '${username}' no fue encontrado.`)
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

    const data = {
      ...person,
      REFERENCES: references ?? [],
      CONTACTS: contacts ?? [],
    }

    return this.success({ data })
  }
}
