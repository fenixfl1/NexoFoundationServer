import { NextFunction, Request, Response } from 'express'
import { StudentService } from '../services/student.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const studentService = new StudentService()

export const createStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await studentService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await studentService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getStudentPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await studentService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await studentService.get_student(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
