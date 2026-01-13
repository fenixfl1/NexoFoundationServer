import { NextFunction, Request, Response } from 'express'
import { NotificationService } from '../services/notification.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const notificationService = new NotificationService()

export const createNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await notificationService.create(
      req.body,
      req['sessionInfo']
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await notificationService.update(
      req.body,
      req['sessionInfo']
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getNotificationPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await notificationService.get_pagination(
      req.body,
      extractPagination(req.query)
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await notificationService.get_notification(Number(id))

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
