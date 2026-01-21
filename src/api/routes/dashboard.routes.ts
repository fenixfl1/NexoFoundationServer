import { Router } from 'express'
import {
  getDashboardActivityController,
  getDashboardMetricsController,
} from '../controllers/dashboard.controller'
import {
  PATH_GET_DASHBOARD_ACTIVITY,
  PATH_GET_DASHBOARD_METRICS,
} from '@src/constants/routes'

const dashboardRouter = Router()

dashboardRouter.get(PATH_GET_DASHBOARD_METRICS, getDashboardMetricsController)
dashboardRouter.get(PATH_GET_DASHBOARD_ACTIVITY, getDashboardActivityController)

export default dashboardRouter
