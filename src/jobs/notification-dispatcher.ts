import { NotificationService } from '@src/api/services/notification.service'

const notificationService = new NotificationService()

export function startNotificationDispatcher(intervalMs = 60000) {
  const execute = async () => {
    try {
      await notificationService.dispatchPending()
    } catch (error) {
      console.error('⚠️  Error procesando notificaciones', error.message)
    }
  }

  execute()
  return setInterval(execute, intervalMs)
}
