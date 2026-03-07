import { Router } from 'express'
import { runOperationalAutomationController } from '../controllers/operational-automation.controller'
import { PATH_RUN_OPERATIONAL_AUTOMATIONS } from '@src/constants/routes'

const operationalAutomationRouter = Router()

operationalAutomationRouter.post(
  PATH_RUN_OPERATIONAL_AUTOMATIONS,
  runOperationalAutomationController
)

export default operationalAutomationRouter
