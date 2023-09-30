import * as passport from 'passport'
import { StrategyOptions, Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt'
import DatabaseService from '../services/database-service'

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}

passport.use(new Strategy(options, async (jwtPayload, done: VerifiedCallback) => {
    const user = await DatabaseService.FindUserById(jwtPayload.id)
    return user === null
        ? done(null, false)
        : done(null, user)
}))
