import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_STUDENT_REQUIREMENT,
  PATH_GET_STUDENT_REQUIREMENT,
  PATH_GET_STUDENT_REQUIREMENT_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createStudentRequirementController,
  getStudentRequirementController,
  getStudentRequirementPaginationController,
  updateStudentRequirementController,
} from '../controllers/student-requirement.controller'
import {
  createStudentRequirementSchema,
  updateStudentRequirementSchema,
} from '../validators/student-requirement.schema'

const studentRequirementRouter = Router()

studentRequirementRouter
  .route(PATH_CREATE_UPDATE_STUDENT_REQUIREMENT)
  .post(
    validateSchema(createStudentRequirementSchema),
    createStudentRequirementController
  )
  .put(
    validateSchema(updateStudentRequirementSchema),
    updateStudentRequirementController
  )

studentRequirementRouter.post(
  PATH_GET_STUDENT_REQUIREMENT_PAGINATION,
  validateSchema(advancedConditionSchema),
  getStudentRequirementPaginationController
)

studentRequirementRouter.get(
  PATH_GET_STUDENT_REQUIREMENT,
  getStudentRequirementController
)

export default studentRequirementRouter
