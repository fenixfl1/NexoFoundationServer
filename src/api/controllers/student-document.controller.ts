import { NextFunction, Request, Response } from 'express'
import { StudentDocumentService } from '../services/student-document.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const studentDocumentService = new StudentDocumentService()

export const createStudentDocumentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await studentDocumentService.create(
      req.body,
      req['sessionInfo']
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateStudentDocumentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await studentDocumentService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getStudentDocumentPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await studentDocumentService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getStudentDocumentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await studentDocumentService.get_document(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
