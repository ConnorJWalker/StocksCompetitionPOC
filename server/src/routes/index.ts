import { Router } from 'express'
import authentication from './authentication'

const router = Router()

router.use('/authentication', authentication)

export default router
