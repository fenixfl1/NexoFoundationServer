import { Router } from 'express'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '@src/api/validators/advanced-condition.schema'
import {
  changePasswordController,
  getPaginatedUserController,
  updateUserController,
} from '../controllers/user.controller'
import {
  PATH_CHANGE_USER_PASSWORD,
  PATH_CREATE_UPDATE_USER,
  PATH_GET_USER_PAGINAtION,
} from '@src/constants/routes'
import {
  changePasswordSchema,
  updateUserSchema,
} from '@src/api/validators/user.schema'

const userRouter = Router()

userRouter.post(
  PATH_GET_USER_PAGINAtION,
  validateSchema(advancedConditionSchema),
  getPaginatedUserController
)
userRouter.put(
  PATH_CHANGE_USER_PASSWORD,
  validateSchema(changePasswordSchema),
  changePasswordController
)
userRouter.put(
  PATH_CREATE_UPDATE_USER,
  validateSchema(updateUserSchema),
  updateUserController
)

export default userRouter
