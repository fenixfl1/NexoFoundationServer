import { sendResponse } from '@src/helpers/response'
import { NextFunction, Response, Request } from 'express'
import { AuthService } from '../services/auth.service'

const authService = new AuthService()

export const loginController = async (
  request: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(request.body)

    return sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
