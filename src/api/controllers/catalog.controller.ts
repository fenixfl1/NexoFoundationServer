import { NextFunction, Request, Response } from 'express'
import { CatalogService } from '../services/catalog.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const catalogService = new CatalogService()

export const createCatalogController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await catalogService.create(req.body, req['sessionInfo'])
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateCatalogController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await catalogService.update(req.body)
    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getCatalogPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await catalogService.get_pagination(
      req.body,
      extractPagination(req.query)
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getCatalogItemsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params
    const result = await catalogService.get_items(key)

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getCatalogController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { catalogId } = req.params
    const result = await catalogService.get_catalog(catalogId)

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const createCatalogItemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params
    const result = await catalogService.create_item(
      key,
      req.body,
      req['sessionInfo']
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateCatalogItemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params
    const result = await catalogService.update_item(key, req.body)

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updateCatalogItemByCatalogController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await catalogService.update_item_by_catalog(req.body)

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getCatalogListController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await catalogService.getCatalogList(req.body)

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
