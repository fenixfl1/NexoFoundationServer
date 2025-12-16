import { NextFunction, Request, Response } from 'express'
import { ParameterService } from '../services/parameter.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const parameterService = new ParameterService()

export const createParameterController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await parameterService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateParameterController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await parameterService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getParameterPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await parameterService.get_pagination(
      req.body,
      extractPagination(req.query)
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getActivityParameterController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { activityId } = req.params
    const result = await parameterService.getActivityParameter(activityId)

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
