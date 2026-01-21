import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm'
import { AuditLog } from '@src/entity/AuditLog'
import { getRequestContext } from '@src/helpers/request-context'

const EXCLUDED_ENTITIES = new Set(['AUDIT_LOG'])

@EventSubscriber()
export class AuditLogSubscriber implements EntitySubscriberInterface {
  listenTo() {
    return Object
  }

  async afterInsert(event: InsertEvent<unknown>) {
    await this.writeLog(event, 'C')
  }

  async afterUpdate(event: UpdateEvent<unknown>) {
    await this.writeLog(event, 'U')
  }

  async afterRemove(event: RemoveEvent<unknown>) {
    await this.writeLog(event, 'D')
  }

  private async writeLog(
    event: InsertEvent<unknown> | UpdateEvent<unknown> | RemoveEvent<unknown>,
    action: 'C' | 'U' | 'D'
  ) {
    const tableName = event.metadata.tableName
    if (EXCLUDED_ENTITIES.has(tableName)) return

    const context = getRequestContext()
    if (!context?.userId) return

    const entity = (event.entity ??
      (event as UpdateEvent<unknown>).databaseEntity) as Record<string, unknown>
    if (!entity) return

    const id = this.getEntityId(event, entity)
    const label = this.getEntityLabel(entity, tableName)

    const payload =
      'updatedColumns' in event && event.updatedColumns?.length
        ? {
            updatedColumns: event.updatedColumns.map((col) => col.propertyName),
          }
        : undefined

    await event.manager.getRepository(AuditLog).insert({
      ACTION_AT: new Date(),
      USER_ID: context.userId,
      ENTITY_TYPE: tableName,
      ENTITY_ID: id,
      ENTITY_LABEL: label,
      ACTION: action,
      MESSAGE: this.getActionMessage(action, tableName, label),
      PAYLOAD: payload ?? null,
      IP_ADDRESS: context.ip ?? null,
      USER_AGENT: context.userAgent ?? null,
    })
  }

  private getEntityId(
    event: InsertEvent<unknown> | UpdateEvent<unknown> | RemoveEvent<unknown>,
    entity: Record<string, unknown>
  ) {
    const primary = event.metadata.primaryColumns?.[0]
    if (!primary) return null
    const key = primary.propertyName
    const value = entity[key]
    return value !== undefined && value !== null ? String(value) : null
  }

  private getEntityLabel(entity: Record<string, unknown>, tableName: string) {
    const candidates = [
      'NAME',
      'TITLE',
      'DESCRIPTION',
      'REQUEST_TYPE',
      'DOCUMENT_TYPE',
      'USERNAME',
      'EMAIL',
      'TAX_ID',
    ]
    const found = candidates.find((key) => entity[key])
    if (found) return String(entity[found]).slice(0, 200)
    return `${tableName}#${this.fallbackId(entity)}`
  }

  private fallbackId(entity: Record<string, unknown>) {
    const key = Object.keys(entity).find((k) => k.toUpperCase().endsWith('_ID'))
    return key ? String(entity[key]) : 'N/A'
  }

  private getActionMessage(
    action: 'C' | 'U' | 'D',
    tableName: string,
    label: string
  ) {
    if (action === 'C') return `Creado ${tableName}: ${label}`
    if (action === 'U') return `Actualizado ${tableName}: ${label}`
    return `Eliminado ${tableName}: ${label}`
  }
}
