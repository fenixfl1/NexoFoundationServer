import { AsyncLocalStorage } from 'node:async_hooks'
import { SessionInfo } from '@src/types/api.types'

type RequestContext = SessionInfo & {
  ip?: string
  userAgent?: string
}

const storage = new AsyncLocalStorage<RequestContext>()

export const runWithContext = (
  context: RequestContext,
  callback: () => void
) => {
  storage.run(context, callback)
}

export const getRequestContext = (): RequestContext | null => {
  return storage.getStore() ?? null
}
