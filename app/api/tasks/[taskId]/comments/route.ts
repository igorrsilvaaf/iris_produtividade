import { type NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getSession } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL!);

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

    const comments = await sql`
      SELECT tc.*, 
             u.name as author_name,
             u.avatar_url as author_avatar
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = ${taskId}
      ORDER BY tc.created_at DESC
    `;

    return NextResponse.json(comments);
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

    const result = await sql`
      INSERT INTO task_comments (task_id, user_id, content)
      VALUES (${taskId}, ${userId}, ${content.trim()})
      RETURNING *,
        (SELECT name FROM users WHERE id = ${userId}) as author_name,
        (SELECT avatar_url FROM users WHERE id = ${userId}) as author_avatar
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
