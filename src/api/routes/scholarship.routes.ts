import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_SCHOLARSHIP,
  PATH_GET_SCHOLARSHIP,
  PATH_GET_SCHOLARSHIP_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createScholarshipController,
  getScholarshipController,
  getScholarshipPaginationController,
  updateScholarshipController,
} from '../controllers/scholarship.controller'
import {
  createScholarshipSchema,
  updateScholarshipSchema,
} from '../validators/scholarship.schema'

const scholarshipRouter = Router()

scholarshipRouter
  .route(PATH_CREATE_UPDATE_SCHOLARSHIP)
  .post(validateSchema(createScholarshipSchema), createScholarshipController)
  .put(validateSchema(updateScholarshipSchema), updateScholarshipController)

scholarshipRouter.post(
  PATH_GET_SCHOLARSHIP_PAGINATION,
  validateSchema(advancedConditionSchema),
  getScholarshipPaginationController
)

scholarshipRouter.get(PATH_GET_SCHOLARSHIP, getScholarshipController)

export default scholarshipRouter
