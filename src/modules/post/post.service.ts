import type { Post } from '../../../generated/prisma/client';
import type { PostWhereInput } from '../../../generated/prisma/models';
import { prisma } from '../../lib/prisma';

const getAllPosts = async (params: {
  search: string | undefined;
  tags: string[];
  isFeatured: boolean | undefined;
}) => {
  const andConditions: PostWhereInput[] = [];

  if (params.search) {
    andConditions.push({
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
    });
  }

  if (params.tags && params.tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: params.tags as string[],
      },
    });
  }

  if (typeof params.isFeatured === 'boolean') {
    andConditions.push({
      isFeatured: params.isFeatured,
    });
  }

  const result = await prisma.post.findMany({
    where: {
      AND: andConditions,
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
