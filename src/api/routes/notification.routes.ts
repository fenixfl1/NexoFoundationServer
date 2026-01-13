import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_NOTIFICATION,
  PATH_GET_NOTIFICATION,
  PATH_GET_NOTIFICATION_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createNotificationController,
  getNotificationController,
  getNotificationPaginationController,
  updateNotificationController,
} from '../controllers/notification.controller'
import {
  createNotificationSchema,
  updateNotificationSchema,
} from '../validators/notification.schema'

const notificationRouter = Router()

notificationRouter
  .route(PATH_CREATE_UPDATE_NOTIFICATION)
  .post(
    validateSchema(createNotificationSchema),
    createNotificationController
  )
  .put(
    validateSchema(updateNotificationSchema),
    updateNotificationController
  )

notificationRouter.post(
  PATH_GET_NOTIFICATION_PAGINATION,
  validateSchema(advancedConditionSchema),
  getNotificationPaginationController
)

notificationRouter.get(PATH_GET_NOTIFICATION, getNotificationController)

export default notificationRouter
