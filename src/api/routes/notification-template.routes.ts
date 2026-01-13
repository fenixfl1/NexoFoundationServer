import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_NOTIFICATION_TEMPLATE,
  PATH_GET_NOTIFICATION_TEMPLATE,
  PATH_GET_NOTIFICATION_TEMPLATE_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createNotificationTemplateController,
  getNotificationTemplateController,
  getNotificationTemplatePaginationController,
  updateNotificationTemplateController,
} from '../controllers/notification-template.controller'
import {
  createNotificationTemplateSchema,
  updateNotificationTemplateSchema,
} from '../validators/notification-template.schema'

const notificationTemplateRouter = Router()

notificationTemplateRouter
  .route(PATH_CREATE_UPDATE_NOTIFICATION_TEMPLATE)
  .post(
    validateSchema(createNotificationTemplateSchema),
    createNotificationTemplateController
  )
  .put(
    validateSchema(updateNotificationTemplateSchema),
    updateNotificationTemplateController
  )

notificationTemplateRouter.post(
  PATH_GET_NOTIFICATION_TEMPLATE_PAGINATION,
  validateSchema(advancedConditionSchema),
  getNotificationTemplatePaginationController
)

notificationTemplateRouter.get(
  PATH_GET_NOTIFICATION_TEMPLATE,
  getNotificationTemplateController
)

export default notificationTemplateRouter
