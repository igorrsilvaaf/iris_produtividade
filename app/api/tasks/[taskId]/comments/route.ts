import { type NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }
    const userId = session.user.id;

    const { taskId } = await params;

    const comments = await prisma.task_comments.findMany({
      where: {
        task_id: parseInt(taskId)
      },
      include: {
        users: {
          select: {
            name: true,
            avatar_url: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const formattedComments = comments.map(comment => ({
      ...comment,
      author_name: comment.users.name,
      author_avatar: comment.users.avatar_url
    }));

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }
    const userId = session.user.id;

    const { taskId } = await params;
    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return new NextResponse('Conteúdo do comentário é obrigatório', { status: 400 });
    }

    const newComment = await prisma.task_comments.create({
      data: {
        task_id: parseInt(taskId),
        user_id: userId,
        content: content.trim()
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
      ...newComment,
      author_name: newComment.users.name,
      author_avatar: newComment.users.avatar_url
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
