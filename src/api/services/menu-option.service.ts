import { Repository } from 'typeorm'
import { BaseService, CatchServiceError } from './base.service'
import { MenuOption } from '@src/entity/MenuOption'
import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { NotFoundError } from '@src/errors/http.error'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'
import { queryBuilder } from '@src/helpers/query-builder'
import { paginate } from '@src/helpers/query-utils'

export class MenuOptionService extends BaseService {
  private menuOptionRepository: Repository<MenuOption>

  constructor() {
    super()
    this.menuOptionRepository = this.dataSource.getRepository(MenuOption)
  }

  @CatchServiceError()
  async create(
    payload: MenuOption,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const { PARENT_ID, PATH } = payload

    const user = await this.userRepository.findOne({
      where: { USER_ID: session.userId },
    })

    let parent: MenuOption
    if (PARENT_ID) {
      parent = await this.menuOptionRepository.findOneBy({
        MENU_OPTION_ID: PARENT_ID,
      })
    }

    const id = await this.getNextMenuOptionId(PARENT_ID)

    const menuOption = this.menuOptionRepository.create({
      ...payload,
      PATH: `/${id}${PATH}`,
      PARENT: parent,
      MENU_OPTION_ID: await this.getNextMenuOptionId(PARENT_ID),
      CREATED_AT: new Date(),
    })

    await this.menuOptionRepository.save(menuOption)

    return this.success({ data: menuOption })
  }

  @CatchServiceError()
  async update(payload: MenuOption): Promise<ApiResponse> {
    const { MENU_OPTION_ID, ...restProps } = payload

    const option = await this.menuOptionRepository.findOneBy({ MENU_OPTION_ID })
    if (!option) {
      throw new NotFoundError(
        `Option de menú con id '${MENU_OPTION_ID}' no existe.`
      )
    }

    await this.menuOptionRepository.update(option, { ...restProps })

    return this.success({ message: 'Opción de menú actualizada exitosamente.' })
  }

  @CatchServiceError()
  private async getNextMenuOptionId(parentId?: string) {
    if (parentId) {
      const [parent] = await this.menuOptionRepository.find({
        select: ['MENU_OPTION_ID'],
        relations: ['CHILDREN'],
        where: {
          MENU_OPTION_ID: parentId,
        },
      })

      return `${parentId}-${parent?.CHILDREN?.length + 1}`
    }

    const options = await this.menuOptionRepository.find()
    return `0-${options?.length + 1}`
  }

  @CatchServiceError()
  async get(username: string): Promise<ApiResponse> {
    const user = await this.userRepository.findOne({
      where: { USERNAME: username },
    })

    const qb = this.menuOptionRepository
      .createQueryBuilder('mo')
      .distinct(true)
      .leftJoinAndSelect('mo.PARENT', 'parent')
      .innerJoin('mo.PERMISSIONS', 'p')
      .innerJoin('p.ACTION', 'a')
      .innerJoin('p.PERMISSION_X_ROLE', 'pxr')
      .innerJoin('pxr.ROLE', 'r')
      .innerJoin('r.ROLES_X_USER', 'ru')
      .where('ru.USER_ID = :userId', { userId: user.USER_ID })
      .andWhere('mo.STATE = :state', { state: 'A' })
      .andWhere('p.STATE = :state', { state: 'A' })
      .andWhere('pxr.STATE = :state', { state: 'A' })
      .andWhere('ru.STATE = :state', { state: 'A' })
      .orderBy('mo.ORDER')

    const menuOptions = await qb.getMany()

    const menuMap = new Map<string, MenuOption & { CHILDREN: MenuOption[] }>()

    menuOptions.forEach((menu) => {
      menuMap.set(menu.MENU_OPTION_ID, { ...menu, CHILDREN: [] })
    })

    const menuTree: MenuOption[] = []

    menuOptions.forEach((menu) => {
      const current = menuMap.get(menu.MENU_OPTION_ID)
      if (!current) return

      const parentId = menu.PARENT?.MENU_OPTION_ID

      if (!parentId || !menuMap.has(parentId)) {
        menuTree.push(current)
      } else {
        const parent = menuMap.get(parentId)
        parent?.CHILDREN?.push(current)
      }

      delete current.PARENT
    })

    return this.success({ data: menuTree })
  }

  @CatchServiceError()
  async get_options_with_permissions(
    payload: AdvancedCondition[],
    pagination: Pagination
  ): Promise<ApiResponse> {
    const optionPermsQueryBuilder = this.menuOptionRepository
      .createQueryBuilder('mo')
      .leftJoinAndSelect('mo.PERMISSIONS', 'p')
      .leftJoinAndSelect('p.ACTION', 'ac')

    const { qb } = queryBuilder(optionPermsQueryBuilder, payload)

    const { data: result, metadata } = await paginate(qb, pagination)

    const data: MenuOption[] = []
    for (const record of result) {
      delete record.ICON
      record.PERMISSIONS = record.PERMISSIONS.map(
        (perm) =>
          ({
            PERMISSION_ID: perm.PERMISSION_ID,
            DESCRIPTION: perm.DESCRIPTION,
            ACTION_ID: perm.ACTION_ID,
            ACTION_NAME: perm.ACTION.NAME,
          } as never)
      )

      data.push(record)
    }

    return this.success({ data, metadata })
  }
}
