import { Router } from 'express'
import PostController from '../controllers/post-controller'
import canAlterComment from '../middleware/can-alter-comment'

const router = Router()

router.post('/reaction/:type/:postType/:postId', PostController.AddReaction)

router.get('/comment/:postType/:postId', PostController.GetComments)

router.post('/comment/:postType/:postId', PostController.AddComment)

router.patch('/comment/:commentId', canAlterComment, PostController.EditComment)

router.delete('/comment/:commentId', canAlterComment, PostController.DeleteComment)

export default router
