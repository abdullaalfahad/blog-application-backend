import type { Request, Response } from 'express';
import { commentService } from './comment.service';

const getCommentsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await commentService.getCommentsById(id as string);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get comment', details: error });
  }
};

const getCommentsByAuthorId = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    const result = await commentService.getCommentsByAuthorId(authorId as string);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get comments by author', details: error });
  }
};

const createComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    req.body.authorId = user?.id;

    const result = await commentService.createComment(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Comment creation failed', details: error });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const result = await commentService.deleteComment(id as string, user?.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Comment deletion failed', details: error });
  }
};

const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const result = await commentService.updateComment(id as string, user?.id as string, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Comment update failed', details: error });
  }
};

export const commentController = {
  getCommentsById,
  getCommentsByAuthorId,
  createComment,
  deleteComment,
  updateComment,
};
