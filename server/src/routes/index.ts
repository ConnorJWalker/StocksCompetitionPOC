import { Router } from 'express'
import * as passport from 'passport'
import authentication from './authentication'
import profile from './profile'
import mainFeed from './main-feed'

const router = Router()

router.use('/authentication', authentication)

router.use('/profile', passport.authenticate('jwt', { session: false }), profile)

router.use('/feed', passport.authenticate('jwt', { session: false }), mainFeed)

export default router
