import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_APPOINTMENT,
  PATH_GET_APPOINTMENT,
  PATH_GET_APPOINTMENT_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import {
  createAppointmentController,
  getAppointmentController,
  getAppointmentPaginationController,
  updateAppointmentController,
} from '../controllers/appointment.controller'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from '../validators/appointment.schema'

const appointmentRouter = Router()

appointmentRouter
  .route(PATH_CREATE_UPDATE_APPOINTMENT)
  .post(validateSchema(createAppointmentSchema), createAppointmentController)
  .put(validateSchema(updateAppointmentSchema), updateAppointmentController)

appointmentRouter.post(
  PATH_GET_APPOINTMENT_PAGINATION,
  validateSchema(advancedConditionSchema),
  getAppointmentPaginationController
)

appointmentRouter.get(PATH_GET_APPOINTMENT, getAppointmentController)

export default appointmentRouter
