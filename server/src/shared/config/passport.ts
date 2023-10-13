import * as passport from 'passport'
import { StrategyOptions, Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt'
import IUser from '../models/iuser'
import { RequestWithTargetUser } from '../../api/middleware/get-profile-user'
import Redis from './redis'

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true
}

passport.use(new Strategy(options, async (req: RequestWithTargetUser, jwtPayload: any, done: VerifiedCallback) => {
    const user = jwtPayload as IUser

    const token = req.header('Authorization')!.split(' ')[1]
    const [loggedOutAccessToken, loggedOutAll] = await Promise.all([
        Redis.get(`logged-out:${token}`),
        Redis.get(`logged-out-all:${user.id}`)
    ])

    if (loggedOutAccessToken !== null || (loggedOutAll !== null && parseInt(loggedOutAll) >= jwtPayload.iat * 1000)) {
        return done(null, false)
    }

    req.authenticatedUser = user
    done(null, user)
}))
