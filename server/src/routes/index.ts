import { Router } from 'express'
import * as passport from 'passport'
import authentication from './authentication'
import profile from './profile'

const router = Router()

router.use('/authentication', authentication)

router.use('/profile', passport.authenticate('jwt', { session: false }), profile)

export default router
