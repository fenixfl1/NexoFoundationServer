import { Router } from 'express'
import {
  PATH_EXPORT_REPORT,
  PATH_GET_REPORT_CATALOG,
  PATH_RUN_REPORT,
} from '@src/constants/routes'
import {
  exportReportController,
  getReportCatalogController,
  runReportController,
} from '../controllers/report.controller'
import { validateSchema } from '../middlewares/validator-middleware'
import {
  exportReportSchema,
  runReportSchema,
} from '../validators/report.schema'

const reportRouter = Router()

reportRouter.get(PATH_GET_REPORT_CATALOG, getReportCatalogController)
reportRouter.post(
  PATH_RUN_REPORT,
  validateSchema(runReportSchema),
  runReportController
)
reportRouter.post(
  PATH_EXPORT_REPORT,
  validateSchema(exportReportSchema),
  exportReportController
)

export default reportRouter

