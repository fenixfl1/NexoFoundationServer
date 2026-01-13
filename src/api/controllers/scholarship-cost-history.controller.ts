import { NextFunction, Request, Response } from 'express'
import { ScholarshipCostHistoryService } from '../services/scholarship-cost-history.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const costHistoryService = new ScholarshipCostHistoryService()

export const createScholarshipCostController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await costHistoryService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateScholarshipCostController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await costHistoryService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getScholarshipCostPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await costHistoryService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getScholarshipCostController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await costHistoryService.get_cost(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
