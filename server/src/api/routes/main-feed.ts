import { Router } from 'express'
import HomeFeedController from '../controllers/home-feed-controller'

const router = Router()

router.get('/accountValues', HomeFeedController.GetAccountValues)

router.get('/accountValues/graph', HomeFeedController.GetAccountValueGraph)

router.get('/', HomeFeedController.GetFeed)

export default router
