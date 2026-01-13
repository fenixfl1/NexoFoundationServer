import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_SPONSOR,
  PATH_GET_SPONSOR,
  PATH_GET_SPONSOR_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createSponsorController,
  getSponsorController,
  getSponsorPaginationController,
  updateSponsorController,
} from '../controllers/sponsor.controller'
import {
  createSponsorSchema,
  updateSponsorSchema,
} from '../validators/sponsor.schema'

const sponsorRouter = Router()

sponsorRouter
  .route(PATH_CREATE_UPDATE_SPONSOR)
  .post(validateSchema(createSponsorSchema), createSponsorController)
  .put(validateSchema(updateSponsorSchema), updateSponsorController)

sponsorRouter.post(
  PATH_GET_SPONSOR_PAGINATION,
  validateSchema(advancedConditionSchema),
  getSponsorPaginationController
)

sponsorRouter.get(PATH_GET_SPONSOR, getSponsorController)

export default sponsorRouter
