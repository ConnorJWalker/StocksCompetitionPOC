import { Router } from 'express'
import ProfileController from '../controllers/profile-controller'

const router = Router()

router.get('/stocks/:discordUsername', ProfileController.GetProfileStocks)

export default router