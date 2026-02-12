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
import notificationTemplateRouter from './notification-template.routes'
import notificationRouter from './notification.routes'
import appointmentRouter from './appointment.routes'
import followUpRouter from './follow-up.routes'
import studentDocumentRouter from './student-document.routes'
import requirementRouter from './requirement.routes'
import studentRequirementRouter from './student-requirement.routes'
import scholarshipRouter from './scholarship.routes'
import disbursementRouter from './disbursement.routes'
import sponsorRouter from './sponsor.routes'
import pledgeRouter from './pledge.routes'
import scholarshipCostRouter from './scholarship-cost-history.routes'
import dashboardRouter from './dashboard.routes'
import termRouter from './term.routes'
import activityRouter from './activity.routes'

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
  notificationTemplateRouter,
  notificationRouter,
  appointmentRouter,
  followUpRouter,
  studentDocumentRouter,
  requirementRouter,
  studentRequirementRouter,
  scholarshipRouter,
  disbursementRouter,
  sponsorRouter,
  pledgeRouter,
  scholarshipCostRouter,
  dashboardRouter,
  termRouter,
  activityRouter,
]

const publicRouter = Router()
const privateRouter = Router()
const mainRouter = Router()

privateRouter.use(authMiddleware)

publicRouter.use(publicRoutes)
privateRouter.use(privateRoutes)

mainRouter.use([publicRouter, privateRouter])

export default mainRouter
