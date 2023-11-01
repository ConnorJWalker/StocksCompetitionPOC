import { Router } from 'express'
import * as passport from 'passport'
import authentication from './authentication'
import Profile from './profile'
import MainFeed from './main-feed'
import User from './user'
import FollowerFeed from './follower-feed'
import Post from './post'
import Instrument from './instrument'

const router = Router()

router.use('/api/authentication', authentication)

router.use('/api/profile', passport.authenticate('jwt', { session: false }), Profile)

router.use('/api/feed', passport.authenticate('jwt', { session: false }), MainFeed)

router.use('/api/user', passport.authenticate('jwt', { session: false }), User)

router.use('/api/following', passport.authenticate('jwt', { session: false }), FollowerFeed)

router.use('/api/post', passport.authenticate('jwt', { session: false }), Post)

router.use('/api/instrument', passport.authenticate('jwt', { session: false }), Instrument)

export default router
