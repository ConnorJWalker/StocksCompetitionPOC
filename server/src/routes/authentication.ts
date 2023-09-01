import { Router } from 'express'
import authenticationController from '../controllers/authentication-controller'

const router = Router()

router.post('/signup', authenticationController.SignUp)

router.post('/login', authenticationController.LogIn)

router.post('/refresh', authenticationController.Refresh)

export default router
