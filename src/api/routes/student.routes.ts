import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_STUDENT,
  PATH_GET_STUDENT,
  PATH_GET_STUDENT_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import {
  createStudentController,
  getStudentController,
  getStudentPaginationController,
  updateStudentController,
} from '../controllers/student.controller'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createStudentSchema,
  updateStudentSchema,
} from '../validators/student.schema'

const studentRouter = Router()

studentRouter.post(
  PATH_CREATE_UPDATE_STUDENT,
  validateSchema(createStudentSchema),
  createStudentController
)

studentRouter.put(
  PATH_CREATE_UPDATE_STUDENT,
  validateSchema(updateStudentSchema),
  updateStudentController
)

studentRouter.post(
  PATH_GET_STUDENT_PAGINATION,
  validateSchema(advancedConditionSchema),
  getStudentPaginationController
)

studentRouter.get(PATH_GET_STUDENT, getStudentController)

export default studentRouter
