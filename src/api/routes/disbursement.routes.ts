import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_DISBURSEMENT,
  PATH_GET_DISBURSEMENT,
  PATH_GET_DISBURSEMENT_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createDisbursementController,
  getDisbursementController,
  getDisbursementPaginationController,
  updateDisbursementController,
} from '../controllers/disbursement.controller'
import {
  createDisbursementSchema,
  updateDisbursementSchema,
} from '../validators/disbursement.schema'

const disbursementRouter = Router()

disbursementRouter
  .route(PATH_CREATE_UPDATE_DISBURSEMENT)
  .post(validateSchema(createDisbursementSchema), createDisbursementController)
  .put(validateSchema(updateDisbursementSchema), updateDisbursementController)

disbursementRouter.post(
  PATH_GET_DISBURSEMENT_PAGINATION,
  validateSchema(advancedConditionSchema),
  getDisbursementPaginationController
)

disbursementRouter.get(PATH_GET_DISBURSEMENT, getDisbursementController)

export default disbursementRouter
