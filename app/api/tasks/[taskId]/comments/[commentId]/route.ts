import { type NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string; commentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }
    const userId = session.user.id;

    const { commentId } = await params;
    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return new NextResponse('Conteúdo do comentário é obrigatório', { status: 400 });
    }

    // Verificar se o comentário existe e pertence ao usuário
    const existingComment = await prisma.task_comments.findFirst({
      where: {
        id: parseInt(commentId),
        user_id: userId
      }
    });

    if (!existingComment) {
      return new NextResponse('Comentário não encontrado ou você não tem permissão para editá-lo', { status: 404 });
    }

    // Atualizar o comentário
    const updatedComment = await prisma.task_comments.update({
      where: {
        id: parseInt(commentId)
      },
      data: {
        content: content.trim(),
        updated_at: new Date()
      },
      include: {
        users: {
          select: {
            name: true,
            avatar_url: true
          }
        }
      }
    });

    return NextResponse.json({
      ...updatedComment,
      author_name: updatedComment.users.name,
      author_avatar: updatedComment.users.avatar_url
    });
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string; commentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }
    const userId = session.user.id;

    const { commentId } = await params;

    // Verificar se o comentário existe e pertence ao usuário
    const existingComment = await prisma.task_comments.findFirst({
      where: {
        id: parseInt(commentId),
        user_id: userId
      }
    });

    if (!existingComment) {
      return new NextResponse('Comentário não encontrado ou você não tem permissão para excluí-lo', { status: 404 });
    }

    // Deletar o comentário
    await prisma.task_comments.delete({
      where: {
        id: parseInt(commentId)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao excluir comentário:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
