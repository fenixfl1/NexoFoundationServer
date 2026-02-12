import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_TERM,
  PATH_GET_TERM,
  PATH_GET_TERM_BY_STUDENT,
  PATH_GET_TERM_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import {
  createTermController,
  getTermController,
  getTermPaginationController,
  getTermsByStudentController,
  updateTermController,
} from '../controllers/term.controller'
import {
  createTermSchema,
  updateTermSchema,
} from '../validators/term.schema'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'

const termRouter = Router()

termRouter
  .route(PATH_CREATE_UPDATE_TERM)
  .post(validateSchema(createTermSchema), createTermController)
  .put(validateSchema(updateTermSchema), updateTermController)

termRouter.post(
  PATH_GET_TERM_PAGINATION,
  validateSchema(advancedConditionSchema),
  getTermPaginationController
)

termRouter.get(PATH_GET_TERM, getTermController)
termRouter.get(PATH_GET_TERM_BY_STUDENT, getTermsByStudentController)

export default termRouter
