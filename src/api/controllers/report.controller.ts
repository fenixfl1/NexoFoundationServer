import { NextFunction, Request, Response } from 'express'
import { extractPagination } from '@src/helpers/extract-pagination'
import { sendResponse } from '@src/helpers/response'
import { ReportService } from '../services/report.service'

const reportService = new ReportService()

export const getReportCatalogController = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await reportService.get_catalog()
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const runReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params
    const result = await reportService.run_report(
      key,
      req.body,
      extractPagination(req.query),
      req['sessionInfo']
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const exportReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params
    const result = await reportService.export_report(
      key,
      req.body,
      req['sessionInfo']
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

