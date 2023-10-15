import { Router } from 'express'
import * as passport from 'passport'
import authentication from './authentication'
import Profile from './profile'
import MainFeed from './main-feed'
import User from './user'
import FollowerFeed from './follower-feed'
import Post from './post'

const router = Router()

router.use('/authentication', authentication)

router.use('/profile', passport.authenticate('jwt', { session: false }), Profile)

router.use('/feed', passport.authenticate('jwt', { session: false }), MainFeed)

router.use('/user', passport.authenticate('jwt', { session: false }), User)

router.use('/following', passport.authenticate('jwt', { session: false }), FollowerFeed)

router.use('/post', passport.authenticate('jwt', { session: false }), Post)

export default router
