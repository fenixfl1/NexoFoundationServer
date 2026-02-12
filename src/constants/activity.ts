import { ActivityStatus } from '@src/entity/Activity'
import { ParticipantStatus } from '@src/entity/ActivityParticipant'

export const ActivityStatusLabels: Record<ActivityStatus, string> = {
  planned: 'Planificada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export const ParticipantStatusLabels: Record<ParticipantStatus, string> = {
  registered: 'Inscrito',
  completed: 'Completado',
  cancelled: 'Cancelado',
}
