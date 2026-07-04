import type { Request, Response } from 'express';
import type { PostStatus } from '../../../generated/prisma/client';
import { postService } from './post.service';

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { search, tags, status, authorId } = req.query;
    const tagsArray = tags ? (tags as string)?.split(',') : [];
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === 'true'
        ? true
        : req.query.isFeatured === 'false'
          ? false
          : undefined
      : undefined;

    const posts = await postService.getAllPosts({
      search: search as string | undefined,
      tags: tagsArray,
      isFeatured,
      status: status as PostStatus | undefined,
      authorId: authorId as string | undefined,
    });
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
