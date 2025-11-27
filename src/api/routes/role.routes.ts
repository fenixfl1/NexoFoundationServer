import { Router } from 'express'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '@src/api/validators/advanced-condition.schema'
import {
  createRoleController,
  getOneRoleController,
  getRolePaginationController,
  updateRoleController,
} from '../controllers/role.controller'
import {
  PATH_CREATE_UPDATE_ROLE,
  PATH_GET_ONE_ROLE,
  PATH_GET_ROLE_PAGINATION,
} from '@src/constants/routes'
import {
  createRoleSchema,
  updateRoleSchema,
} from '@src/api/validators/role.schema'

const roleRouter = Router()

roleRouter
  .route(PATH_CREATE_UPDATE_ROLE)
  .post(validateSchema(createRoleSchema), createRoleController)
  .put(validateSchema(updateRoleSchema), updateRoleController)

roleRouter.post(
  PATH_GET_ROLE_PAGINATION,
  validateSchema(advancedConditionSchema),
  getRolePaginationController
)

roleRouter.get(PATH_GET_ONE_ROLE, getOneRoleController)

export default roleRouter
