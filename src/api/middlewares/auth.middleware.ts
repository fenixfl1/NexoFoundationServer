import { HTTP_STATUS_UNAUTHORIZED } from '@src/constants/status-codes'
import { Request, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { runWithContext } from '@src/helpers/request-context'

const authMiddleware = (req: Request, res: any, next: NextFunction) => {
  const token = req.headers.authorization

  if (!token) {
    return res
      .status(HTTP_STATUS_UNAUTHORIZED)
      .json({ message: 'Access denied. No token provided.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    req['sessionInfo'] = decoded as never
    runWithContext(
      {
        userId: decoded['userId'],
        username: decoded['username'],
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
      () => next()
    )
  } catch (error) {
    return res
      .status(HTTP_STATUS_UNAUTHORIZED)
      .json({ message: 'Invalid token.' })
  }
}

export default authMiddleware
