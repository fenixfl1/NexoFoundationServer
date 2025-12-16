import {
  AdvancedCondition,
  ApiResponse,
  Pagination,
  SessionInfo,
} from '@src/types/api.types'
import { BaseService, CatchServiceError } from './base.service'
import { In, Repository } from 'typeorm'
import { Catalog } from '@src/entity/Catalog'
import { CatalogItem } from '@src/entity/CatalogItem'
import { DbConflictError, NotFoundError } from '@src/errors/http.error'
import { whereClauseBuilder } from '@src/helpers/where-clause-builder'
import { paginatedQuery } from '@src/helpers/query-utils'
import { HTTP_STATUS_NO_CONTENT } from '@src/constants/status-codes'

interface CreateCatalogPayload {
  NAME: string
  KEY: string
  DESCRIPTION?: string | null
  STATE?: string
  ITEMS?: CatalogItemPayload[]
}

interface UpdateCatalogPayload extends CreateCatalogPayload {
  CATALOG_ID: number
}

interface CatalogItemPayload {
  VALUE: string
  LABEL: string
  ORDER?: number
  EXTRA?: Record<string, any> | null
  STATE?: string
}

interface UpdateCatalogItemPayload extends CatalogItemPayload {
  ITEM_ID: number
}

interface UpdateCatalogItemByCatalogPayload
  extends Partial<CatalogItemPayload> {
  ITEM_ID: number
  CATALOG_ID: number
}

interface GetCatalogListPayload {
  [key: string]: number
}

export class CatalogService extends BaseService {
  private catalogRepository: Repository<Catalog>
  private catalogItemRepository: Repository<CatalogItem>

  constructor() {
    super()
    this.catalogRepository = this.dataSource.getRepository(Catalog)
    this.catalogItemRepository = this.dataSource.getRepository(CatalogItem)
  }

  @CatchServiceError()
  async create(
    payload: CreateCatalogPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const { ITEMS = [], ...catalogData } = payload

    const existing = await this.catalogRepository.findOne({
      where: { KEY: catalogData.KEY },
    })

    if (existing) {
      throw new DbConflictError(
        `El catálogo con clave '${catalogData.KEY}' ya existe.`
      )
    }

    const values = ITEMS.map((item) => item.VALUE)
    if (new Set(values).size !== values.length) {
      throw new DbConflictError(
        'Los valores de los ítems del catálogo contienen duplicados.'
      )
    }

    return this.dataSource.transaction(async (manager) => {
      const catalog = this.catalogRepository.create({
        ...catalogData,
        CREATED_BY: session?.userId,
        STATE: catalogData.STATE ?? 'A',
      })

      const savedCatalog = await manager.save(catalog)

      if (ITEMS.length) {
        const items = ITEMS.map((item) =>
          this.catalogItemRepository.create({
            ...item,
            STATE: item.STATE ?? 'A',
            CATALOG_ID: savedCatalog.CATALOG_ID,
            CATALOG: savedCatalog,
            CREATED_BY: session?.userId,
          })
        )

        await manager.save(items)
      }

      return this.success({
        message: 'Catálogo creado correctamente.',
        data: {
          ...savedCatalog,
          ITEMS,
        },
      })
    })
  }

  @CatchServiceError()
  async update(payload: UpdateCatalogPayload): Promise<ApiResponse> {
    const { CATALOG_ID, KEY, ...rest } = payload

    const catalog = await this.catalogRepository.findOne({
      where: { CATALOG_ID },
    })

    if (!catalog) {
      throw new NotFoundError(
        `El catálogo con identificador '${CATALOG_ID}' no fue encontrado.`
      )
    }

    if (KEY && KEY !== catalog.KEY) {
      const existsKey = await this.catalogRepository.findOne({
        where: { KEY },
      })

      if (existsKey) {
        throw new DbConflictError(
          `La clave de catálogo '${KEY}' ya está en uso.`
        )
      }
    }

    await this.catalogRepository.update({ CATALOG_ID }, { KEY, ...rest })

    return this.success({ message: 'Catálogo actualizado correctamente.' })
  }

  @CatchServiceError()
  async get_pagination(
    payload: AdvancedCondition[],
    pagination: Pagination
  ): Promise<ApiResponse> {
    const { values, whereClause } = whereClauseBuilder(payload)

    const statement = `
      SELECT
        c.*,
        (
          SELECT COUNT(*) FROM PUBLIC."CATALOG_ITEM" ci WHERE ci."CATALOG_ID" = c."CATALOG_ID"
        ) AS "ITEMS_COUNT"
      FROM PUBLIC."CATALOG" c
      ${whereClause}
      ORDER BY c."CATALOG_ID"
    `

    const [data = [], metadata] = await paginatedQuery({
      statement,
      values,
      pagination,
    })

    if (!data.length) {
      return this.success({ status: HTTP_STATUS_NO_CONTENT })
    }

    const catalogIds = data.map((item: any) => item.CATALOG_ID)

    const items = await this.catalogItemRepository.find({
      select: [
        'STATE',
        'ITEM_ID',
        'CATALOG_ID',
        'VALUE',
        'LABEL',
        'ORDER',
        'EXTRA',
      ],
      where: {
        CATALOG_ID: In(catalogIds),
      },
      order: {
        CATALOG_ID: 'ASC',
        ORDER: 'ASC',
        ITEM_ID: 'ASC',
      },
    })

    const itemsByCatalog = items.reduce<Record<number, CatalogItem[]>>(
      (acc, item) => {
        acc[item.CATALOG_ID] = acc[item.CATALOG_ID] ?? []
        acc[item.CATALOG_ID].push(item)
        return acc
      },
      {}
    )

    const dataWithItems = data.map((item: any) => ({
      ...item,
      ITEMS: itemsByCatalog[item.CATALOG_ID] ?? [],
    }))

    return this.success({ data: dataWithItems, metadata })
  }

  @CatchServiceError()
  async get_catalog(catalogId: string): Promise<ApiResponse<Catalog>> {
    const [catalog] = await this.catalogRepository.find({
      relations: ['ITEMS'],
      where: {
        CATALOG_ID: Number(catalogId),
      },
    })

    if (!catalog) {
      throw new NotFoundError(`Catálogo con id '${catalogId}' no encontrado.`)
    }

    const data: Catalog = {
      ...catalog,
      ITEMS: catalog.ITEMS.map(
        (item) =>
          ({
            STATE: item.STATE,
            ITEM_ID: item.ITEM_ID,
            VALUE: item.VALUE,
            LABEL: item.LABEL,
            ORDER: item.ORDER,
            EXTRA: item.EXTRA,
          } as never)
      ),
    }

    return this.success({ data })
  }

  @CatchServiceError()
  async get_items(key: string): Promise<ApiResponse> {
    const catalog = await this.catalogRepository.findOne({
      where: { KEY: key },
    })

    if (!catalog) {
      throw new NotFoundError(`El catálogo '${key}' no fue encontrado.`)
    }

    const data = await this.catalogItemRepository.find({
      where: {
        CATALOG_ID: catalog.CATALOG_ID,
        STATE: 'A',
      },
      order: {
        ORDER: 'ASC',
        ITEM_ID: 'ASC',
      },
    })

    return this.success({ data })
  }

  @CatchServiceError()
  async create_item(
    key: string,
    payload: CatalogItemPayload,
    session: SessionInfo
  ): Promise<ApiResponse> {
    const catalog = await this.catalogRepository.findOne({
      where: { KEY: key },
    })

    if (!catalog) {
      throw new NotFoundError(`El catálogo '${key}' no fue encontrado.`)
    }

    const exists = await this.catalogItemRepository.findOne({
      where: {
        CATALOG_ID: catalog.CATALOG_ID,
        VALUE: payload.VALUE,
      },
    })

    if (exists) {
      throw new DbConflictError(
        `El valor '${payload.VALUE}' ya existe en el catálogo '${key}'.`
      )
    }

    const item = this.catalogItemRepository.create({
      ...payload,
      CATALOG_ID: catalog.CATALOG_ID,
      CATALOG: catalog,
      CREATED_BY: session?.userId,
      STATE: payload.STATE ?? 'A',
    })

    await this.catalogItemRepository.save(item)

    return this.success({ message: 'Ítem creado correctamente.' })
  }

  @CatchServiceError()
  async update_item(
    key: string,
    payload: UpdateCatalogItemPayload
  ): Promise<ApiResponse> {
    const catalog = await this.catalogRepository.findOne({
      where: { KEY: key },
    })

    if (!catalog) {
      throw new NotFoundError(`El catálogo '${key}' no fue encontrado.`)
    }

    const item = await this.catalogItemRepository.findOne({
      where: { ITEM_ID: payload.ITEM_ID, CATALOG_ID: catalog.CATALOG_ID },
    })

    if (!item) {
      throw new NotFoundError(
        `El ítem '${payload.ITEM_ID}' no pertenece al catálogo '${key}'.`
      )
    }

    if (payload.VALUE && payload.VALUE !== item.VALUE) {
      const existsValue = await this.catalogItemRepository.findOne({
        where: {
          CATALOG_ID: catalog.CATALOG_ID,
          VALUE: payload.VALUE,
        },
      })

      if (existsValue) {
        throw new DbConflictError(
          `El valor '${payload.VALUE}' ya existe en el catálogo '${key}'.`
        )
      }
    }

    const { ITEM_ID, ...rest } = payload

    await this.catalogItemRepository.update({ ITEM_ID }, { ...rest })

    return this.success({ message: 'Ítem actualizado correctamente.' })
  }

  @CatchServiceError()
  async update_item_by_catalog(
    payload: UpdateCatalogItemByCatalogPayload
  ): Promise<ApiResponse> {
    const { ITEM_ID, CATALOG_ID, ...rest } = payload

    const catalog = await this.catalogRepository.findOne({
      where: { CATALOG_ID },
    })

    if (!catalog) {
      throw new NotFoundError(
        `El catálogo con id '${CATALOG_ID}' no fue encontrado.`
      )
    }

    const item = await this.catalogItemRepository.findOne({
      where: { ITEM_ID, CATALOG_ID },
    })

    if (!item) {
      throw new NotFoundError(
        `El ítem '${ITEM_ID}' no pertenece al catálogo '${CATALOG_ID}'.`
      )
    }

    if (rest.VALUE && rest.VALUE !== item.VALUE) {
      const existsValue = await this.catalogItemRepository.findOne({
        where: { CATALOG_ID, VALUE: rest.VALUE },
      })

      if (existsValue) {
        throw new DbConflictError(
          `El valor '${rest.VALUE}' ya existe en el catálogo '${CATALOG_ID}'.`
        )
      }
    }

    await this.catalogItemRepository.update({ ITEM_ID }, { ...rest })

    return this.success({ message: 'Ítem actualizado correctamente.' })
  }

  @CatchServiceError()
  async getCatalogList(
    payload: GetCatalogListPayload
  ): Promise<ApiResponse<Record<string, Partial<CatalogItem>[]>>> {
    const alias: Record<string, string> = {}
    const ids = new Array<number>()
    Object.entries(payload).forEach(([key, value]) => {
      alias[value] = key
      ids.push(value)
    })

    const catalogs = await this.catalogRepository.find({
      relations: ['ITEMS'],
      where: {
        CATALOG_ID: In(ids),
      },
    })

    if (!catalogs?.length) {
      return this.noContent()
    }

    const data: Record<string, CatalogItem[]> = {}
    catalogs.forEach(async ({ CATALOG_ID, ITEMS }) => {
      data[alias[CATALOG_ID]] = (await Promise.all(
        ITEMS.map((item) => ({
          ITEM_ID: item.ITEM_ID,
          LABEL: item.LABEL,
          VALUE: item.VALUE,
          EXTRA: item.EXTRA,
        }))
      )) as never
    })

    return this.success({ data })
  }
}
