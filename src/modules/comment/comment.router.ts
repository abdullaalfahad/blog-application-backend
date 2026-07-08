import express, { Router } from 'express';
import auth, { UserRole } from '../../middlewares/auth';
import { commentController } from './comment.controller';

const router = express.Router();

router.get('/:id', commentController.getCommentsById);

router.get('/author/:authorId', commentController.getCommentsByAuthorId);

router.delete('/:id', auth(UserRole.ADMIN, UserRole.USER), commentController.deleteComment);

router.patch('/:id', auth(UserRole.ADMIN, UserRole.USER), commentController.updateComment);

router.post('/', auth(UserRole.ADMIN, UserRole.USER), commentController.createComment);

router.patch('/:id/moderate', auth(UserRole.ADMIN), commentController.moderateComment);

export const commentRouter: Router = router;
