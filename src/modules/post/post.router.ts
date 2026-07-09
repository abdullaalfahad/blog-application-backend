import express, { Router } from 'express';
import auth, { UserRole } from '../../middlewares/auth';
import { postController } from './post.controller';

const router = express.Router();

router.get('/', postController.getAllPosts);

router.get('/get-post-by-id/:postId', postController.getPostById);

router.get('/get-my-posts', auth(UserRole.USER, UserRole.ADMIN), postController.getMyPosts);

router.post('/', auth(UserRole.USER, UserRole.ADMIN), postController.createPost);

router.patch('/:postId', auth(UserRole.USER, UserRole.ADMIN), postController.updatePost);

export const postRouter: Router = router;
