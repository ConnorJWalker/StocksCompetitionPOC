import { Router } from 'express'
import AuthenticationController from '../controllers/authentication-controller'

const router = Router()

router.post('/signup', AuthenticationController.SignUp)

router.post('/login', AuthenticationController.LogIn)

router.post('/refresh', AuthenticationController.Refresh)

router.get('/validate-username/:discordUsername', AuthenticationController.ValidateDiscordUsername)

router.get('/profile-picture/:discordUsername', AuthenticationController.GetProfilePicture)

export default router
