import { OperationalAutomationService } from '@src/api/services/operational-automation.service'

const operationalAutomationService = new OperationalAutomationService()

export function startOperationalAutomationDispatcher(
  intervalMs = 60 * 60 * 1000
) {
  const execute = async () => {
    try {
      await operationalAutomationService.run()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('⚠️  Error ejecutando automatizaciones operativas', error.message)
    }
  }

  execute()
  return setInterval(execute, intervalMs)
}
