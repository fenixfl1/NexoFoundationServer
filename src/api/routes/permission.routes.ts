import { Router } from 'express'
import { getPermissionsController } from '../controllers/permission.controller'
import { PATH_GET_PERMISSIONS_PAGINATION } from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '@src/api/validators/advanced-condition.schema'

const permissionRouter = Router()

permissionRouter.post(
  PATH_GET_PERMISSIONS_PAGINATION,
  validateSchema(advancedConditionSchema),
  getPermissionsController
)

export default permissionRouter
