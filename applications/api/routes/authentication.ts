import { Router } from 'express'
import { authenticationLimiter } from '../middleware/rate-limit'
import AuthenticationController from '../controllers/authentication-controller'

const router = Router()

router.post('/signup', authenticationLimiter, AuthenticationController.SignUp)

router.post('/login', authenticationLimiter, AuthenticationController.LogIn)

router.post('/logout', authenticationLimiter, AuthenticationController.LogOut)

router.post('/refresh', authenticationLimiter, AuthenticationController.Refresh)

router.get('/validate-username/:discordUsername', AuthenticationController.ValidateDiscordUsername)

router.get('/profile-picture/:discordUsername', AuthenticationController.GetProfilePicture)

export default router
