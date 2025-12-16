import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_PARAMETER,
  PATH_GET_ACTIVITY_PARAMETER,
  PATH_GET_PARAMETER_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import {
  createParameterController,
  getActivityParameterController,
  getParameterPaginationController,
  updateParameterController,
} from '../controllers/parameter.controller'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createParameterSchema,
  updateParameterSchema,
} from '../validators/parameter.schema'

const parameterRouter = Router()

parameterRouter
  .route(PATH_CREATE_UPDATE_PARAMETER)
  .post(validateSchema(createParameterSchema), createParameterController)
  .put(validateSchema(updateParameterSchema), updateParameterController)

parameterRouter.post(
  PATH_GET_PARAMETER_PAGINATION,
  validateSchema(advancedConditionSchema),
  getParameterPaginationController
)

parameterRouter.get(PATH_GET_ACTIVITY_PARAMETER, getActivityParameterController)

export default parameterRouter
