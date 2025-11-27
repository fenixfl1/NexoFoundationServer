import { Router } from 'express'
import authMiddleware from '../middlewares/auth.middleware'
import authRouter from './auth.routes'
import menuOptionRouter from './menu-option.routes'
import roleRouter from './role.routes'
import permissionRouter from './permission.routes'
import personRouter from './person.routes'
import userRouter from './user.routes'
import studentRouter from './student.routes'

const publicRoutes: Router[] = [authRouter]
const privateRoutes: Router[] = [
  menuOptionRouter,
  roleRouter,
  permissionRouter,
  personRouter,
  userRouter,
  studentRouter,
]

const publicRouter = Router()
const privateRouter = Router()
const mainRouter = Router()

privateRouter.use(authMiddleware)

publicRouter.use(publicRoutes)
privateRouter.use(privateRoutes)

mainRouter.use([publicRouter, privateRouter])

export default mainRouter
