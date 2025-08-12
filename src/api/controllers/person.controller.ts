import { NextFunction, Request, Response } from 'express'
import { PersonService } from '../services/person.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'

const personService = new PersonService()

export const createPersonController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await personService.create(req.body, req['sessionInfo'])

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getPersonPaginationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await personService.get_pagination(
      req.body,
      extractPagination(req.query)
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const getPersonController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params
    const result = await personService.get_person(username)

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
