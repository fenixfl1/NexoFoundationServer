import { NextFunction, Request, Response } from 'express'
import { sendResponse } from '@src/helpers/response'
import { ActivityService } from '../services/activity.service'
import { extractPagination } from '@src/helpers/extract-pagination'

const activityService = new ActivityService()

export const createActivityController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await activityService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateActivityController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await activityService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getActivityController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await activityService.get_activity(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getActivityPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await activityService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const enrollActivityController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await activityService.enroll(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateParticipantController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await activityService.updateParticipant(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
