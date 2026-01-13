import { NextFunction, Request, Response } from 'express'
import { RequirementService } from '../services/requirement.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const requirementService = new RequirementService()

export const createRequirementController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await requirementService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateRequirementController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await requirementService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getRequirementPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await requirementService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getRequirementController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await requirementService.get_requirement(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
