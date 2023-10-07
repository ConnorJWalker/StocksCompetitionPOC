import { Router } from 'express'
import UserController from '../controllers/user-controller'
import GetProfileUser from '../middleware/get-profile-user'

const router = Router()

router.get('/follow/:discordUsername', GetProfileUser, UserController.IsFollowing)

router.post('/follow/:discordUsername', GetProfileUser, UserController.Follow)

export default router
