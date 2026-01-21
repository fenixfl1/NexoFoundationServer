import { NextFunction, Request, Response } from 'express'
import { DashboardService } from '../services/dashboard.service'
import { sendResponse } from '@src/helpers/response'

const dashboardService = new DashboardService()

export const getDashboardMetricsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await dashboardService.get_metrics(req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getDashboardActivityController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await dashboardService.get_activity(req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
