import { NextFunction, Request, Response } from 'express'
import { RequestService } from '../services/request.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const requestService = new RequestService()

export const createRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await requestService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await requestService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getRequestPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await requestService.get_pagination(
      req.body,
      extractPagination(req.query),
      req['sessionInfo']
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await requestService.get_request(Number(id), req['sessionInfo'])

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
