import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_SCHOLARSHIP_COST,
  PATH_GET_SCHOLARSHIP_COST,
  PATH_GET_SCHOLARSHIP_COST_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createScholarshipCostController,
  getScholarshipCostController,
  getScholarshipCostPaginationController,
  updateScholarshipCostController,
} from '../controllers/scholarship-cost-history.controller'
import {
  createScholarshipCostSchema,
  updateScholarshipCostSchema,
} from '../validators/scholarship-cost-history.schema'

const scholarshipCostRouter = Router()

scholarshipCostRouter
  .route(PATH_CREATE_UPDATE_SCHOLARSHIP_COST)
  .post(
    validateSchema(createScholarshipCostSchema),
    createScholarshipCostController
  )
  .put(
    validateSchema(updateScholarshipCostSchema),
    updateScholarshipCostController
  )

scholarshipCostRouter.post(
  PATH_GET_SCHOLARSHIP_COST_PAGINATION,
  validateSchema(advancedConditionSchema),
  getScholarshipCostPaginationController
)

scholarshipCostRouter.get(
  PATH_GET_SCHOLARSHIP_COST,
  getScholarshipCostController
)

export default scholarshipCostRouter
