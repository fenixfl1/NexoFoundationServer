import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_REQUEST,
  PATH_GET_REQUEST,
  PATH_GET_REQUEST_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createRequestSchema,
  updateRequestSchema,
} from '../validators/request.schema'
import {
  createRequestController,
  getRequestController,
  getRequestPaginationController,
  updateRequestController,
} from '../controllers/request.controller'

const requestRouter = Router()

requestRouter.post(
  PATH_CREATE_UPDATE_REQUEST,
  validateSchema(createRequestSchema),
  createRequestController
)

requestRouter.put(
  PATH_CREATE_UPDATE_REQUEST,
  validateSchema(updateRequestSchema),
  updateRequestController
)

requestRouter.post(
  PATH_GET_REQUEST_PAGINATION,
  validateSchema(advancedConditionSchema),
  getRequestPaginationController
)

requestRouter.get(PATH_GET_REQUEST, getRequestController)

export default requestRouter
