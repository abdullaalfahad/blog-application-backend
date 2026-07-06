import { CommentStatus, type Post, type PostStatus } from '../../../generated/prisma/client';
import type { PostWhereInput } from '../../../generated/prisma/models';
import { prisma } from '../../lib/prisma';

const getAllPosts = async (params: {
  search: string | undefined;
  tags: string[];
  isFeatured: boolean | undefined;
  status: PostStatus | undefined;
  authorId: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
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

  if (params.status) {
    andConditions.push({
      status: params.status,
    });
  }

  if (params.authorId) {
    andConditions.push({
      authorId: params.authorId,
    });
  }

  const result = await prisma.post.findMany({
    take: params.limit,
    skip: params.skip,
    where: {
      AND: andConditions,
    },
    orderBy: {
      [params.sortBy]: params.sortOrder,
    },
  });

  const total = await prisma.post.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: result,
    pagination: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    },
  };
};

const getPostById = async (postId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const post = await tx.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: {
          where: {
            parentId: null,
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy: {
                createdAt: 'asc',
              },
              include: {
                replies: {
                  where: {
                    status: CommentStatus.APPROVED,
                  },
                  orderBy: {
                    createdAt: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    return post;
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
  getPostById,
  createPost,
};
