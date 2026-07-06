import type { Request, Response } from 'express';
import { commentService } from './comment.service';

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

export const commentController = {
  createComment,
};
