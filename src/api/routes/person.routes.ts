import { Router } from 'express'
import { validateSchema } from '../middlewares/validator-middleware'
import {
  createPersonController,
  createPersonReferencesController,
  updatePersonReferenceController,
  getPersonController,
  getPersonPaginationController,
  updatePersonController,
} from '../controllers/person.controller'
import {
  createPersonSchema,
  createPersonReferencesSchema,
  updatePersonReferenceSchema,
  updatePersonSchema,
} from '@src/api/validators/person.schema'
import {
  PATH_CREATE_UPDATE_PERSON,
  PATH_GET_PERSON,
  PATH_GET_PERSON_PAGINATION,
  PATH_CREATE_PERSON_REFERENCES,
  PATH_UPDATE_PERSON_REFERENCE,
} from '@src/constants/routes'
import { advancedConditionSchema } from '@src/api/validators/advanced-condition.schema'

const personRouter = Router()

personRouter
  .route(PATH_CREATE_UPDATE_PERSON)
  .post(validateSchema(createPersonSchema), createPersonController)
  .put(validateSchema(updatePersonSchema), updatePersonController)

personRouter
  .route(PATH_CREATE_PERSON_REFERENCES)
  .post(
    validateSchema(createPersonReferencesSchema),
    createPersonReferencesController
  )

personRouter.put(
  PATH_UPDATE_PERSON_REFERENCE,
  validateSchema(updatePersonReferenceSchema),
  updatePersonReferenceController
)

personRouter.post(
  PATH_GET_PERSON_PAGINATION,
  validateSchema(advancedConditionSchema),
  getPersonPaginationController
)
personRouter.get(PATH_GET_PERSON, getPersonController)

export default personRouter
