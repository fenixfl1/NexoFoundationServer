import { NextFunction, Request, Response } from 'express'
import { ScholarshipService } from '../services/scholarship.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const scholarshipService = new ScholarshipService()

export const createScholarshipController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await scholarshipService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateScholarshipController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await scholarshipService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getScholarshipPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await scholarshipService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getScholarshipController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await scholarshipService.get_scholarship(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
