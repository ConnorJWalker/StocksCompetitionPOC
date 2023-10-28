import { DraftHeadersVersion, rateLimit } from 'express-rate-limit'
import { Request, Response } from 'express'

const options = {
    standardHeaders: 'draft-7' as DraftHeadersVersion,
    legacyHeaders: false,
    statusCode: 429,
    message: () => ({ error: 'too many requests' }),
    keyGenerator: (req: Request, res: Response) => (req.headers['x-forwarded-for'] || req.ip) as string
}

export const authenticationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    skipSuccessfulRequests: true,
    ...options
})

export const postsLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    ...options
})
