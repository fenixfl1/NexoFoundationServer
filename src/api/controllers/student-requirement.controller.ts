import { NextFunction, Request, Response } from 'express'
import { StudentRequirementService } from '../services/student-requirement.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const studentRequirementService = new StudentRequirementService()

export const createStudentRequirementController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await studentRequirementService.create(
      req.body,
      req['sessionInfo']
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateStudentRequirementController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await studentRequirementService.update(
      req.body,
      req['sessionInfo']
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getStudentRequirementPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await studentRequirementService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getStudentRequirementController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await studentRequirementService.get_student_requirement(
      Number(id)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
