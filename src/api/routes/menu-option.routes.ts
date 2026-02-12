import { Router } from 'express'
import { validateSchema } from '../middlewares/validator-middleware'
import {
  createMenuOptionController,
  getMenuOptionController,
  getMenuOptionWithPermissionsController,
  updateMenuOptionController,
} from '../controllers/menu-option.controller'
import {
  createMenuOptionsSchema,
  updateMenuOptionsSchema,
} from '@src/api/validators/menu-option.schema'
import {
  PATH_CREATE_UPDATE_MENU_OPTION,
  PATH_GET_MENU_OPTION_WITH_PERMISSIONS,
  PATH_GET_USER_MENU_OPTIONS,
} from '@src/constants/routes'
import { advancedConditionSchema } from '@src/api/validators/advanced-condition.schema'

const menuOptionRouter = Router()

menuOptionRouter.get(PATH_GET_USER_MENU_OPTIONS, getMenuOptionController)

menuOptionRouter
  .route(PATH_CREATE_UPDATE_MENU_OPTION)
  .post(validateSchema(createMenuOptionsSchema), createMenuOptionController)
  .put(validateSchema(updateMenuOptionsSchema), updateMenuOptionController)

menuOptionRouter.post(
  PATH_GET_MENU_OPTION_WITH_PERMISSIONS,
  validateSchema(advancedConditionSchema),
  getMenuOptionWithPermissionsController
)

export default menuOptionRouter
