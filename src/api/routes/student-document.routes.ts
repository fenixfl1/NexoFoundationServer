import { Router } from 'express'
import {
  PATH_CREATE_UPDATE_STUDENT_DOCUMENT,
  PATH_GET_STUDENT_DOCUMENT,
  PATH_GET_STUDENT_DOCUMENT_PAGINATION,
} from '@src/constants/routes'
import { validateSchema } from '../middlewares/validator-middleware'
import { advancedConditionSchema } from '../validators/advanced-condition.schema'
import {
  createStudentDocumentController,
  getStudentDocumentController,
  getStudentDocumentPaginationController,
  updateStudentDocumentController,
} from '../controllers/student-document.controller'
import {
  createStudentDocumentSchema,
  updateStudentDocumentSchema,
} from '../validators/student-document.schema'

const studentDocumentRouter = Router()

studentDocumentRouter
  .route(PATH_CREATE_UPDATE_STUDENT_DOCUMENT)
  .post(
    validateSchema(createStudentDocumentSchema),
    createStudentDocumentController
  )
  .put(
    validateSchema(updateStudentDocumentSchema),
    updateStudentDocumentController
  )

studentDocumentRouter.post(
  PATH_GET_STUDENT_DOCUMENT_PAGINATION,
  validateSchema(advancedConditionSchema),
  getStudentDocumentPaginationController
)

studentDocumentRouter.get(
  PATH_GET_STUDENT_DOCUMENT,
  getStudentDocumentController
)

export default studentDocumentRouter
