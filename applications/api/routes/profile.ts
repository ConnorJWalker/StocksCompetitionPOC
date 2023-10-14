import { Router } from 'express'
import ProfileController from '../controllers/profile-controller'
import GetProfileUser from '../middleware/get-profile-user'
import getProfileUser from '../middleware/get-profile-user'

const router = Router()

router.get('/user/:discordUsername', GetProfileUser, ProfileController.GetUser)

router.get('/openPositions/:discordUsername', GetProfileUser, ProfileController.GetOpenPositions)

router.get('/accountValue/graph/:discordUsername', GetProfileUser, ProfileController.GetAccountValueGraph)

router.get('/feed/:discordUsername', getProfileUser, ProfileController.GetFeed)

export default router
