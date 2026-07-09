import type { Request, Response } from 'express';
import type { PostStatus } from '../../../generated/prisma/client';
import paginationSortingHelper from '../../helpers/paginationSortingHelper';
import { UserRole } from '../../middlewares/auth';
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

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(req.query as any);

    const posts = await postService.getAllPosts({
      search: search as string | undefined,
      tags: tagsArray,
      isFeatured,
      status: status as PostStatus | undefined,
      authorId: authorId as string | undefined,
      page: page,
      limit: limit,
      skip: skip,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve posts', details: error });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const result = await postService.getPostById(postId as string);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve posts', details: error });
  }
};

const getMyPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const result = await postService.getMyPosts(user?.id as string);
    res.status(200).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Post not found';
    res.status(404).json({ success: false, message: errorMessage, details: error });
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

const updatePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = req.user;
    const isAdmin = user?.role === UserRole.ADMIN;

    const result = await postService.updatePost(
      postId as string,
      req.body,
      user?.id as string,
      isAdmin
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Post update failed';
    res.status(404).json({ success: false, message: errorMessage, details: error });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = req.user;
    const isAdmin = user?.role === UserRole.ADMIN;

    const result = await postService.deletePost(postId as string, user?.id as string, isAdmin);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Post deletion failed';
    res.status(404).json({ success: false, message: errorMessage, details: error });
  }
};

const getStats = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const isAdmin = user?.role === UserRole.ADMIN;

    const result = await postService.getStats(isAdmin);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve stats';
    res.status(500).json({ success: false, message: errorMessage, details: error });
  }
};

export const postController = {
  getAllPosts,
  getPostById,
  createPost,
  getStats,
  getMyPosts,
  updatePost,
  deletePost,
};
