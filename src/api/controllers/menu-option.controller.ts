import { sendResponse } from '@src/helpers/response'
import { MenuOptionService } from '../services/menu-option.service'
import { NextFunction, Request, Response } from 'express'
import { extractPagination } from '@src/helpers/extract-pagination'

const menuOptionService = new MenuOptionService()

export const createMenuOptionController = async (
  request: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await menuOptionService.create(
      request.body,
      request['sessionInfo']
    )

    return sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateMenuOptionController = async (
  request: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await menuOptionService.update(request.body)

    return sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getMenuOptionController = async (
  request: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = request.params
    const result = await menuOptionService.get(username)

    return sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getMenuOptionWithPermissionsController = async (
  request: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await menuOptionService.get_options_with_permissions(
      request.body,
      extractPagination(request.query)
    )

    return sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
