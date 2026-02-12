import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_ACTIVITY,
  PATH_GET_ACTIVITY,
  PATH_GET_ACTIVITY_PAGINATION,
  PATH_ACTIVITY_ENROLL,
  PATH_ACTIVITY_PARTICIPANT_UPDATE,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import {
  createActivitySchema,
  enrollActivitySchema,
  updateActivitySchema,
  updateParticipantSchema,
} from '../validators/activity.schema'
import {
  createActivityController,
  enrollActivityController,
  getActivityController,
  getActivityPaginationController,
  updateActivityController,
  updateParticipantController,
} from '../controllers/activity.controller'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'

const activityRouter = Router()

activityRouter
  .route(PATH_CREATE_UPDATE_ACTIVITY)
  .post(validateSchema(createActivitySchema), createActivityController)
  .put(validateSchema(updateActivitySchema), updateActivityController)

activityRouter.post(
  PATH_GET_ACTIVITY_PAGINATION,
  validateSchema(advancedConditionSchema),
  getActivityPaginationController
)

activityRouter.get(PATH_GET_ACTIVITY, getActivityController)

activityRouter.post(
  PATH_ACTIVITY_ENROLL,
  validateSchema(enrollActivitySchema),
  enrollActivityController
)

activityRouter.put(
  PATH_ACTIVITY_PARTICIPANT_UPDATE,
  validateSchema(updateParticipantSchema),
  updateParticipantController
)

export default activityRouter
