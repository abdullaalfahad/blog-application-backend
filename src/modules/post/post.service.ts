import type { Post } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';

const getAllPosts = async (params: { search: string | undefined }) => {
  const result = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: params.search as string,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: params.search as string,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            has: params.search as string,
          },
        },
      ],
    },
  });
  return result;
};

const createPost = async (
  data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>,
  userId: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });

  return result;
};

export const postService = {
  getAllPosts,
  createPost,
};
