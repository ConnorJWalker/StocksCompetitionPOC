import { Router } from 'express'
import ProfileController from '../controllers/profile-controller'
import GetProfileUser from '../middleware/get-profile-user'

const router = Router()

router.get('/stocks/:discordUsername', GetProfileUser, ProfileController.GetProfileStocks)

router.get('/cash/:discordUsername', GetProfileUser, ProfileController.GetProfileCash)

export default router