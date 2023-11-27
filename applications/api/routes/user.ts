import { Router } from 'express'
import UserController from '../controllers/user-controller'
import AdminOnly from '../middleware/admin-only'
import GetProfileUser from '../middleware/get-profile-user'

const router = Router()

router.post('/follow/:discordUsername', GetProfileUser, UserController.Follow)

router.get('/follow/:discordUsername', GetProfileUser, UserController.IsFollowing)

router.get('/follow', UserController.GetFollowing)

router.get('/apikey', UserController.ApiKeyIsValid)

router.patch('/apikey', UserController.UpdateApiKey)

router.patch('/displayName', UserController.UpdateDisplayName)

router.patch('/displayName/:discordUsername', AdminOnly, GetProfileUser, UserController.AdminUpdateDisplayName)

router.patch('/profilePicture', UserController.UpdateDiscordProfilePicture)

router.get('/strikes', UserController.GetDisqualificationStrikes)

export default router
