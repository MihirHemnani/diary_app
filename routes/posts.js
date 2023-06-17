import express from 'express';
import { requireAuth } from '../middleware/auth.js'
import {
    getAllPosts,
    getPost,
    createPost,
    updatePost,
    deletePost
} from '../controllers/postControllers.js' // .js is important

const router = express.Router();
router.use(requireAuth)

router.get('/', getAllPosts)
router.post('/', createPost)
router.get('/:id', getPost)
router.patch('/:id', updatePost)
router.delete('/:id', deletePost)

export default router;
