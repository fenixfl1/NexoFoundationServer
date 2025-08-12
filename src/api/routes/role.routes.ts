import { Router } from 'express'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '@src/validators/advanced-condition.schema'
import {
  createRoleController,
  getRolePaginationController,
  updateRoleController,
} from '../controllers/role.controller'
import {
  PATH_CREATE_UPDATE_ROLE,
  PATH_GET_ROLE_PAGINATION,
} from '@src/constants/routes'
import { createRoleSchema, updateRoleSchema } from '@src/validators/role.schema'

const roleRouter = Router()

roleRouter.post(
  PATH_CREATE_UPDATE_ROLE,
  validateSchema(createRoleSchema),
  createRoleController
)
roleRouter.put(
  PATH_CREATE_UPDATE_ROLE,
  validateSchema(updateRoleSchema),
  updateRoleController
)

roleRouter.post(
  PATH_GET_ROLE_PAGINATION,
  validateSchema(advancedConditionSchema),
  getRolePaginationController
)

export default roleRouter
