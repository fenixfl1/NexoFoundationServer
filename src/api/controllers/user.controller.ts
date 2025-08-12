import { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/user.service'
import { extractPagination } from '@src/helpers/extract-pagination'
import { sendResponse } from '@src/helpers/response'

const userService = new UserService()

export const getPaginatedUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await userService.get_pagination(
      req.body,
      extractPagination(req.query)
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const changePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await userService.changePassword(req.body)

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await userService.update(req.body)

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
