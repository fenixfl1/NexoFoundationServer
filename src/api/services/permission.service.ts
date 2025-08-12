import { Repository } from 'typeorm'
import { BaseService, CatchServiceError } from './base.service'
import { Permission } from '@src/entity/Permission'
import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { queryBuilder } from '@src/helpers/query-builder'
import { paginate } from '@src/helpers/query-utils'

export class PermissionService extends BaseService {
  private permissionRepository: Repository<Permission>

  constructor() {
    super()
    this.permissionRepository = this.dataSource.getRepository(Permission)
  }

  @CatchServiceError()
  async create(
    payload: Permission,
    session: SessionInfo
  ): Promise<ApiResponse> {
    return this.success({})
  }

  @CatchServiceError()
  async update(
    payload: Permission,
    session: SessionInfo
  ): Promise<ApiResponse> {
    return this.success({})
  }

  @CatchServiceError()
  async get_permissions(
    payload: AdvancedCondition[],
    pagination: Pagination
  ): Promise<ApiResponse> {
    const permQueryBuilder = this.permissionRepository
      .createQueryBuilder('perm')
      .leftJoinAndSelect('perm.MENU_OPTION', 'mo')
      .leftJoinAndSelect('perm.ACTION', 'ac')
      .select([
        'perm.PERMISSION_ID',
        'perm.DESCRIPTION',
        'perm.STATE',
        'perm.CREATED_AT',
        'perm.CREATED_BY',
        'perm.MENU_OPTION_ID',
        'perm.ACTION_ID',
        'ac.NAME',
        'mo.NAME',
      ])

    const { qb } = queryBuilder(permQueryBuilder, payload)

    const { data, metadata } = await paginate<any>(qb, pagination)

    const result = []
    for (const record of data) {
      record.MENU_OPTION_NAME = record.MENU_OPTION.NAME
      record.ACTION_NAME = record.ACTION.NAME

      delete record.ACTION
      delete record.MENU_OPTION

      result.push(record)
    }

    return this.success({ data: result, metadata })
  }
}
