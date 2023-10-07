import { Router } from 'express'
import * as passport from 'passport'
import authentication from './authentication'
import Profile from './profile'
import MainFeed from './main-feed'
import User from './user'

const router = Router()

router.use('/authentication', authentication)

router.use('/profile', passport.authenticate('jwt', { session: false }), Profile)

router.use('/feed', passport.authenticate('jwt', { session: false }), MainFeed)

router.use('/user', passport.authenticate('jwt', { session: false }), User)

export default router
