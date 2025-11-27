import { EntityManager, In, Repository } from 'typeorm'
import { BaseService, CatchServiceError } from './base.service'
import { Role } from '@src/entity/Role'
import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { NotFoundError } from '@src/errors/http.error'
import { MenuOption } from '@src/entity/MenuOption'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'
import { PermissionRole } from '@src/entity/PermissionRole'

interface PermissionPayload {
  ROLE: Role
  MENU_OPTIONS: string[]
}

interface CreateRolePayload extends Role {
  PERMISSIONS: number[]
}

export class RoleService extends BaseService {
  private roleRepository: Repository<Role>
  private menuOptionRepository: Repository<MenuOption>
  private permissionRoleRepository: Repository<PermissionRole>

  constructor() {
    super()
    this.roleRepository = this.dataSource.getRepository(Role)
    this.permissionRoleRepository =
      this.dataSource.getRepository(PermissionRole)
  }

  @CatchServiceError()
  async create(
    payload: CreateRolePayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const { PERMISSIONS, ...restProps } = payload
    return this.dataSource.transaction(async (manager) => {
      const user = {} as never

      const common = {
        CREATED_AT: new Date(),
        CREATOR: user,
        STATE: 'A',
      }

      const role = this.roleRepository.create({
        ...restProps,
        ...common,
      })

      const newRole = await manager.save(role)

      const permissions: PermissionRole[] = []
      for (const perm of PERMISSIONS) {
        const permission = this.permissionRoleRepository.create({
          ...common,
          PERMISSION_ID: perm,
          ROLE: newRole,
        })

        permissions.push(permission)
      }

      await manager.save(permissions)

      return this.success({ message: 'Rol creado exitosamente.' })
    })
  }

  @CatchServiceError()
  async update(payload: Role, session: SessionInfo): Promise<ApiResponse> {
    const { ROLE_ID, ...restProps } = payload

    const role = await this.roleRepository.findOneBy({ ROLE_ID })

    if (!role) {
      throw new NotFoundError(`Rol con id '${ROLE_ID}' no existe.`)
    }

    await this.roleRepository.update({ ROLE_ID }, { ...restProps })

    return this.success({ message: 'Rol actualizado exitosamente.' })
  }

  @CatchServiceError()
  async permissions(
    payload: PermissionPayload,
    manager: EntityManager
  ): Promise<unknown> {
    const { ROLE, MENU_OPTIONS = [] } = payload

    const menuOptRoles = []

    if (MENU_OPTIONS?.length) {
      const options = await this.menuOptionRepository.find({
        where: {
          MENU_OPTION_ID: In(MENU_OPTIONS),
        },
      })

      for (const option of options) {
        menuOptRoles.push({
          MENU_OPTION: option,
          ROLE,
          CREATED_AT: new Date(),
          STATE: 'A',
        })
      }
    }

    await manager.save(menuOptRoles)

    return
  }

  async getPagination(
    payload: AdvancedCondition[],
    pagination: Pagination
  ): Promise<ApiResponse> {
    const { values, whereClause } = whereClauseBuilder(payload)

    const statement = `
      SELECT 
        *
      FROM  (
        SELECT 
        r.*,
        s."NAME" || ' ' || s."LAST_NAME" AS "CREATOR"
      FROM 
        public."ROLE" r
        LEFT JOIN public."USER" u ON  u."USER_ID" = r."CREATED_BY"
        LEFT JOIN public."PERSON" s ON s."PERSON_ID" = u."PERSON_ID"
      ) AS subquery
      ${whereClause}
      ORDER BY "ROLE_ID"
    `

    const [data = [], metadata] = await paginatedQuery({
      statement,
      values,
      pagination,
    })

    if (!data.length) {
      return this.noContent()
    }

    return this.success({ data, metadata })
  }

  @CatchServiceError()
  public async getOne(roleId: number): Promise<ApiResponse> {
    const role = await this.roleRepository.findOne({
      where: {
        ROLE_ID: roleId,
      },
    })

    if (!role) {
      throw new NotFoundError(`Rol con id '${roleId}' no encontrado.`)
    }

    const permissions = await this.permissionRoleRepository.find({
      select: ['PERMISSION_ID'],
      where: {
        ROLE_ID: roleId,
        STATE: 'A',
      },
    })

    const data = {
      ...role,
      PERMISSIONS: permissions.map((perm) => perm.PERMISSION_ID),
    }

    return this.success({ data })
  }
}
