import express, { Router } from 'express';
import auth, { UserRole } from '../../middlewares/auth';
import { commentController } from './comment.controller';

const router = express.Router();

router.get('/:id', commentController.getCommentsById);

router.post('/', auth(UserRole.ADMIN, UserRole.USER), commentController.createComment);

export const commentRouter: Router = router;
