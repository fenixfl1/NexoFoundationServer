import { Router } from 'express'
import authMiddleware from '../middlewares/auth.middleware'
import authRouter from './auth.routes'
import menuOptionRouter from './menu-option.routes'
import roleRouter from './role.routes'
import permissionRouter from './permission.routes'
import personRouter from './person.routes'
import userRouter from './user.routes'
import studentRouter from './student.routes'
import catalogRouter from './catalog.routes'
import parameterRouter from './parameter.routes'
import requestRouter from './request.routes'

const publicRoutes: Router[] = [authRouter]
const privateRoutes: Router[] = [
  menuOptionRouter,
  roleRouter,
  permissionRouter,
  personRouter,
  userRouter,
  studentRouter,
  catalogRouter,
  parameterRouter,
  requestRouter,
]

const publicRouter = Router()
const privateRouter = Router()
const mainRouter = Router()

privateRouter.use(authMiddleware)

publicRouter.use(publicRoutes)
privateRouter.use(privateRoutes)

mainRouter.use([publicRouter, privateRouter])

export default mainRouter
