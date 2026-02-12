import { NextFunction, Request, Response } from 'express'
import { sendResponse } from '@src/helpers/response'
import { TermService } from '../services/term.service'

const termService = new TermService()

export const createTermController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await termService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateTermController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await termService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getTermController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const result = await termService.get_term(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getTermsByStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { studentId } = req.params
    const result = await termService.get_by_student(Number(studentId))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getTermPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, size } = req.query
    const result = await termService.get_pagination(
      req.body,
      {
        page: Number(page) || 1,
        size: Number(size) || 20,
      }
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
