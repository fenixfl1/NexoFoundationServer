import { NextFunction, Request, Response } from 'express'
import { RoleService } from '../services/role.service'
import { extractPagination } from '@src/helpers/extract-pagination'
import { sendResponse } from '@src/helpers/response'

const roleService = new RoleService()

export const createRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await roleService.create(req.body, req['sessionInfo'])

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await roleService.update(req.body, req['sessionInfo'])

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getRolePaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await roleService.getPagination(
      req.body,
      extractPagination(req.query)
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getOneRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roleId } = req.params
    const result = await roleService.getOne(Number(roleId))

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
