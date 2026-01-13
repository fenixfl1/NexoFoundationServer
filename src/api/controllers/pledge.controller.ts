import { NextFunction, Request, Response } from 'express'
import { PledgeService } from '../services/pledge.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const pledgeService = new PledgeService()

export const createPledgeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await pledgeService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updatePledgeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await pledgeService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getPledgePaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await pledgeService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getPledgeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await pledgeService.get_pledge(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
