import { NextFunction, Request, Response } from 'express'
import { NotificationTemplateService } from '../services/notification-template.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const notificationTemplateService = new NotificationTemplateService()

export const createNotificationTemplateController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await notificationTemplateService.create(
      req.body,
      req['sessionInfo']
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateNotificationTemplateController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await notificationTemplateService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getNotificationTemplatePaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await notificationTemplateService.get_pagination(
      req.body,
      extractPagination(req.query)
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getNotificationTemplateController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await notificationTemplateService.get_template(Number(id))

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
