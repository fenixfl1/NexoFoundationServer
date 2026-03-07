import { NextFunction, Request, Response } from 'express'
import { OperationalAutomationService } from '../services/operational-automation.service'
import { sendResponse } from '@src/helpers/response'

const operationalAutomationService = new OperationalAutomationService()

export const runOperationalAutomationController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await operationalAutomationService.run()
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
