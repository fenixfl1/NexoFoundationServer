import { NextFunction, Request, Response } from 'express'
import { AppointmentService } from '../services/appointment.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const appointmentService = new AppointmentService()

export const createAppointmentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await appointmentService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateAppointmentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await appointmentService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getAppointmentPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await appointmentService.get_pagination(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getAppointmentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const result = await appointmentService.get_appointment(Number(id))
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
