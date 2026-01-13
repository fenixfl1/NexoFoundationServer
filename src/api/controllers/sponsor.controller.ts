import { NextFunction, Request, Response } from 'express'
import { SponsorService } from '../services/sponsor.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const sponsorService = new SponsorService()

export const createSponsorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await sponsorService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateSponsorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await sponsorService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getSponsorPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await sponsorService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getSponsorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await sponsorService.get_sponsor(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
