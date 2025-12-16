import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_CATALOG,
  PATH_GET_CATALOG_ITEMS,
  PATH_UPDATE_CATALOG_ITEM_BY_ID,
  PATH_GET_CATALOG_PAGINATION,
  PATH_GET_CATALOG,
  PATH_GET_CATALOG_LIST,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import {
  createCatalogController,
  createCatalogItemController,
  getCatalogItemsController,
  getCatalogPaginationController,
  updateCatalogController,
  updateCatalogItemController,
  updateCatalogItemByCatalogController,
  getCatalogController,
  getCatalogListController,
} from '../controllers/catalog.controller'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createCatalogItemSchema,
  createCatalogSchema,
  getCatalogItemsParamsSchema,
  getCatalogListSchema,
  updateCatalogItemSchema,
  updateCatalogSchema,
} from '../validators/catalog.schema'
import {
  updateCatalogItemByIdParamsSchema,
  updateCatalogItemByIdSchema,
} from '../validators/catalog-update-item-by-id.schema'

const catalogRouter = Router()

catalogRouter.post(
  PATH_CREATE_UPDATE_CATALOG,
  validateSchema(createCatalogSchema),
  createCatalogController
)

catalogRouter.put(
  PATH_CREATE_UPDATE_CATALOG,
  validateSchema(updateCatalogSchema),
  updateCatalogController
)

catalogRouter.post(
  PATH_GET_CATALOG_PAGINATION,
  validateSchema(advancedConditionSchema),
  getCatalogPaginationController
)

catalogRouter.get(
  PATH_GET_CATALOG_ITEMS,
  validateSchema(getCatalogItemsParamsSchema, 'params'),
  getCatalogItemsController
)

catalogRouter.get(PATH_GET_CATALOG, getCatalogController)

catalogRouter.post(
  PATH_GET_CATALOG_ITEMS,
  validateSchema(getCatalogItemsParamsSchema, 'params'),
  validateSchema(createCatalogItemSchema),
  createCatalogItemController
)

catalogRouter.put(
  PATH_GET_CATALOG_ITEMS,
  validateSchema(getCatalogItemsParamsSchema, 'params'),
  validateSchema(updateCatalogItemSchema),
  updateCatalogItemController
)

catalogRouter.post(
  PATH_GET_CATALOG_LIST,
  validateSchema(getCatalogListSchema),
  getCatalogListController
)

catalogRouter.put(
  PATH_UPDATE_CATALOG_ITEM_BY_ID,
  validateSchema(updateCatalogItemByIdParamsSchema, 'params'),
  validateSchema(updateCatalogItemByIdSchema),
  (req, res, next) => {
    const payload = {
      ...req.body,
      ITEM_ID: Number(req.params.itemId),
      CATALOG_ID: Number(req.params.catalogId),
    }
    req.body = payload
    next()
  },
  updateCatalogItemByCatalogController
)

export default catalogRouter
