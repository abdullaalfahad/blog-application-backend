import type { CommentStatus } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';

const getCommentsById = async (id: string) => {
  const result = await prisma.comment.findUnique({
    where: {
      id,
    },
  });

  return result;
};

const getCommentsByAuthorId = async (authorId: string) => {
  const result = await prisma.comment.findMany({
    where: {
      authorId,
    },
  });

  return result;
};

const createComment = async (payload: {
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
}) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payload.postId,
    },
  });

  if (payload.parentId) {
    await prisma.comment.findUniqueOrThrow({
      where: {
        id: payload.parentId,
      },
    });
  }

  const result = await prisma.comment.create({
    data: payload,
  });

  return result;
};

const deleteComment = async (id: string, authorId: string) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id,
      authorId,
    },
  });

  if (!comment) {
    throw new Error('Comment not found or you are not the author');
  }

  const deletedComment = await prisma.comment.delete({
    where: {
      id,
    },
  });

  return deletedComment;
};

const updateComment = async (
  id: string,
  authorId: string,
  data: { content: string; status?: CommentStatus }
) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id,
      authorId,
    },
  });

  if (!comment) {
    throw new Error('Comment not found or you are not the author');
  }

  const updatedComment = await prisma.comment.update({
    where: {
      id,
    },
    data,
  });

  return updatedComment;
};

const moderateComment = async (id: string, status: CommentStatus) => {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (comment.status === status) {
    throw new Error(`Comment is already ${status}`);
  }

  return await prisma.comment.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

export const commentService = {
  createComment,
  getCommentsById,
  getCommentsByAuthorId,
  deleteComment,
  updateComment,
  moderateComment,
};
