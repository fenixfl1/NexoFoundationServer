import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_PLEDGE,
  PATH_GET_PLEDGE,
  PATH_GET_PLEDGE_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createPledgeController,
  getPledgeController,
  getPledgePaginationController,
  updatePledgeController,
} from '../controllers/pledge.controller'
import {
  createPledgeSchema,
  updatePledgeSchema,
} from '../validators/pledge.schema'

const pledgeRouter = Router()

pledgeRouter
  .route(PATH_CREATE_UPDATE_PLEDGE)
  .post(validateSchema(createPledgeSchema), createPledgeController)
  .put(validateSchema(updatePledgeSchema), updatePledgeController)

pledgeRouter.post(
  PATH_GET_PLEDGE_PAGINATION,
  validateSchema(advancedConditionSchema),
  getPledgePaginationController
)

pledgeRouter.get(PATH_GET_PLEDGE, getPledgeController)

export default pledgeRouter
