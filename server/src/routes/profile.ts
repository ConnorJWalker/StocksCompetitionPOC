import { Router } from 'express'
import ProfileController from '../controllers/profile-controller'

const router = Router()

router.get('/stocks/:discordUsername', ProfileController.GetProfileStocks)

router.get('/cash/:discordUsername', ProfileController.GetProfileCash)

export default router