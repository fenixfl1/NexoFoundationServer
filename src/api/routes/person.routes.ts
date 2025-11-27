import { Router } from 'express'
import { validateSchema } from '../middlewares/validator-middleware'
import {
  createPersonController,
  getPersonController,
  getPersonPaginationController,
} from '../controllers/person.controller'
import { createPersonSchema } from '@src/api/validators/person.schema'
import {
  PATH_CREATE_UPDATE_PERSON,
  PATH_GET_PERSON,
  PATH_GET_PERSON_PAGINATION,
} from '@src/constants/routes'
import { advancedConditionSchema } from '@src/api/validators/advanced-condition.schema'

const personRouter = Router()

personRouter.post(
  PATH_CREATE_UPDATE_PERSON,
  validateSchema(createPersonSchema),
  createPersonController
)
personRouter.post(
  PATH_GET_PERSON_PAGINATION,
  validateSchema(advancedConditionSchema),
  getPersonPaginationController
)
personRouter.get(PATH_GET_PERSON, getPersonController)

export default personRouter
