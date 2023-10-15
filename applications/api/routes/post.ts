import { Router } from 'express'
import PostController from '../controllers/post-controller'

const router = Router()

router.post('/reaction/:type/:postType/:postId', PostController.AddReaction)

export default router
