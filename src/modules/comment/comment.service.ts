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

export const commentService = {
  createComment,
  getCommentsById,
  getCommentsByAuthorId,
  deleteComment,
};
