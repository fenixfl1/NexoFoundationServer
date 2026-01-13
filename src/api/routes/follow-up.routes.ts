import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_FOLLOW_UP,
  PATH_GET_FOLLOW_UP,
  PATH_GET_FOLLOW_UP_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createFollowUpController,
  getFollowUpController,
  getFollowUpPaginationController,
  updateFollowUpController,
} from '../controllers/follow-up.controller'
import {
  createFollowUpSchema,
  updateFollowUpSchema,
} from '../validators/follow-up.schema'

const followUpRouter = Router()

followUpRouter
  .route(PATH_CREATE_UPDATE_FOLLOW_UP)
  .post(validateSchema(createFollowUpSchema), createFollowUpController)
  .put(validateSchema(updateFollowUpSchema), updateFollowUpController)

followUpRouter.post(
  PATH_GET_FOLLOW_UP_PAGINATION,
  validateSchema(advancedConditionSchema),
  getFollowUpPaginationController
)

followUpRouter.get(PATH_GET_FOLLOW_UP, getFollowUpController)

export default followUpRouter
