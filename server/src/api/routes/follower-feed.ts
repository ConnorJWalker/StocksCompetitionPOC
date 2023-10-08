import { Router } from 'express'
import FollowingFeedController from '../controllers/following-feed-controller'

const router = Router()

router.get('/accountValues', FollowingFeedController.GetAccountValues)

router.get('/accountValues/graph', FollowingFeedController.GetAccountValueGraph)

router.get('/', FollowingFeedController.GetFeed)

export default router
