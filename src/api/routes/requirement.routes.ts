import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_REQUIREMENT,
  PATH_GET_REQUIREMENT,
  PATH_GET_REQUIREMENT_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createRequirementController,
  getRequirementController,
  getRequirementPaginationController,
  updateRequirementController,
} from '../controllers/requirement.controller'
import {
  createRequirementSchema,
  updateRequirementSchema,
} from '../validators/requirement.schema'

const requirementRouter = Router()

requirementRouter
  .route(PATH_CREATE_UPDATE_REQUIREMENT)
  .post(validateSchema(createRequirementSchema), createRequirementController)
  .put(validateSchema(updateRequirementSchema), updateRequirementController)

requirementRouter.post(
  PATH_GET_REQUIREMENT_PAGINATION,
  validateSchema(advancedConditionSchema),
  getRequirementPaginationController
)

requirementRouter.get(PATH_GET_REQUIREMENT, getRequirementController)

export default requirementRouter
