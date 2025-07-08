import { type NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../../../../lib/supabase';
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

    const result = await sql`
      UPDATE task_comments
      SET content = ${content.trim()}, updated_at = NOW()
      WHERE id = ${commentId} AND user_id = ${userId}
      RETURNING *,
        (SELECT name FROM users WHERE id = ${userId}) as author_name,
        (SELECT avatar_url FROM users WHERE id = ${userId}) as author_avatar
    `;

    if (result.length === 0) {
      return new NextResponse('Comentário não encontrado ou você não tem permissão para editá-lo', { status: 404 });
    }

    return NextResponse.json(result[0]);
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

    const result = await sql`
      DELETE FROM task_comments
      WHERE id = ${commentId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return new NextResponse('Comentário não encontrado ou você não tem permissão para excluí-lo', { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao excluir comentário:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
