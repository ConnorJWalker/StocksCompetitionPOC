import { Router } from 'express'
import PostController from '../controllers/post-controller'

const router = Router()

router.post('/reaction/:type/:postType/:postId', PostController.AddReaction)

router.post('/comment/:postType/:postId', PostController.AddComment)

export default router
