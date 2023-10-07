import * as passport from 'passport'
import { StrategyOptions, Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt'
import IUser from '../models/iuser'
import { RequestWithTargetUser } from '../../api/middleware/get-profile-user'

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true
}

passport.use(new Strategy(options, async (req: RequestWithTargetUser, jwtPayload: any, done: VerifiedCallback) => {
    const user = jwtPayload as IUser
    req.authenticatedUser = user

    done(null, user)
}))
