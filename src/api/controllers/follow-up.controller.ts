import { NextFunction, Request, Response } from 'express'
import { FollowUpService } from '../services/follow-up.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const followUpService = new FollowUpService()

export const createFollowUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await followUpService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateFollowUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await followUpService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getFollowUpPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await followUpService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getFollowUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await followUpService.get_follow_up(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
