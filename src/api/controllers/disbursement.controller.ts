import { NextFunction, Request, Response } from 'express'
import { DisbursementService } from '../services/disbursement.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const disbursementService = new DisbursementService()

export const createDisbursementController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await disbursementService.create(
      req.body,
      req['sessionInfo']
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateDisbursementController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await disbursementService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getDisbursementPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await disbursementService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getDisbursementController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await disbursementService.get_disbursement(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
