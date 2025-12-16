import { NextFunction, Request, Response } from 'express'
import { PersonService } from '../services/person.service'
import { sendResponse } from '@src/helpers/response'
import { extractPagination } from '@src/helpers/extract-pagination'
import { ApiResponse } from '@src/types/api.types'
import { Person } from '@src/entity'

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

export const updatePersonController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await personService.update(req.body)

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const createPersonReferencesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await personService.addReferences(
      req.body,
      req['sessionInfo']
    )

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}

export const updatePersonReferenceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await personService.updateReference(
      req.body,
      req['sessionInfo']
    )

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
    const { identifier } = req.params

    let result: ApiResponse<Person>
    if (isNaN(Number(identifier))) {
      result = await personService.getPersonByUsername(identifier)
    } else {
      result = await personService.getPersonById(Number(identifier))
    }

    sendResponse(res, result)
  } catch (error) {
    next(error)
  }
}
