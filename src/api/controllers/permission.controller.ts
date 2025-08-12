import { sendResponse } from '@src/helpers/response'
import { PermissionService } from '../services/permission.service'
import { NextFunction, Request, Response } from 'express'
import { extractPagination } from '@src/helpers/extract-pagination'

const permissionService = new PermissionService()

export const createPermissionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await permissionService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updatePermissionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await permissionService.update(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getPermissionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await permissionService.get_permissions(
      req.body,
      extractPagination(req.query)
    )
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
