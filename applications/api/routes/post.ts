import { Router } from 'express'
import PostController from '../controllers/post-controller'
import canAlterComment from '../middleware/can-alter-comment'
import { postsLimiter } from '../middleware/rate-limit'

const router = Router()

router.post('/reaction/:type/:postType/:postId', postsLimiter, PostController.AddReaction)

router.get('/comment/:postType/:postId', PostController.GetComments)

router.post('/comment/:postType/:postId', postsLimiter, PostController.AddComment)

router.patch('/comment/:commentId', postsLimiter, canAlterComment, PostController.EditComment)

router.delete('/comment/:commentId', postsLimiter, canAlterComment, PostController.DeleteComment)

export default router
