import type { Request, Response } from 'express';
import { postService } from './post.service';

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const posts = await postService.getAllPosts({ search: search as string | undefined });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve posts', details: error });
  }
};

const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const result = await postService.createPost(req.body, user.id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Post creation failed', details: error });
  }
};

export const postController = {
  getAllPosts,
  createPost,
};
