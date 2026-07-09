import { CommentStatus, type Post, type PostStatus } from '../../../generated/prisma/client';
import type { PostWhereInput } from '../../../generated/prisma/models';
import { prisma } from '../../lib/prisma';
import { UserRole } from '../../middlewares/auth';

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
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return post;
  });

  return result;
};

const getMyPosts = async (authorId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: 'ACTIVE',
    },
  });

  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
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

const updatePost = async (
  postId: string,
  data: Partial<Post>,
  userId: string,
  isAdmin: boolean
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      authorId: true,
    },
  });

  if (!isAdmin && post.authorId !== userId) {
    throw new Error('You are not owner/creator of this post, you cannot update it');
  }

  if (!isAdmin && data.isFeatured) {
    delete data.isFeatured;
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data,
  });

  return result;
};

const deletePost = async (postId: string, userId: string, isAdmin: boolean) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      authorId: true,
    },
  });

  if (!isAdmin && post.authorId !== userId) {
    throw new Error('You are not owner/creator of this post, you cannot update it');
  }

  const result = await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return result;
};

const getStats = async (isAdmin: boolean) => {
  if (!isAdmin) {
    throw new Error('You are not authorized to access this resource');
  }

  const result = await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalViews,
      totalComments,
      approvedComments,
      rejectedComments,
      totalUsers,
      users,
      admin,
    ] = await Promise.all([
      tx.post.count(),
      tx.post.count({ where: { status: 'PUBLISHED' } }),
      tx.post.count({ where: { status: 'DRAFT' } }),
      tx.post.count({ where: { status: 'ARCHIVED' } }),
      tx.post.aggregate({ _sum: { views: true } }),
      tx.comment.count(),
      tx.comment.count({ where: { status: 'APPROVED' } }),
      tx.comment.count({ where: { status: 'REJECTED' } }),
      tx.user.count(),
      tx.user.count({ where: { role: UserRole.USER } }),
      tx.user.count({ where: { role: UserRole.ADMIN } }),
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalViews: totalViews._sum.views || 0,
      totalComments,
      approvedComments,
      rejectedComments,
      totalUsers,
      users,
      admin,
    };
  });

  return result;
};

export const postService = {
  getAllPosts,
  getPostById,
  createPost,
  getMyPosts,
  updatePost,
  deletePost,
  getStats,
};
