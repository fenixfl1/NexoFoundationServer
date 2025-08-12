import { Router } from 'express'
import { validateSchema } from '../middlewares/validator-middleware'
import { loginController } from '../controllers/auth.controller'
import { authSchema } from '@src/validators/auth.schema'
import { PATH_LOGIN } from '@src/constants/routes'

const authRouter = Router()

authRouter.post(PATH_LOGIN, validateSchema(authSchema), loginController)

export default authRouter
