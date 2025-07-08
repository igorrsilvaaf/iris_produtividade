import { type NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../../../lib/supabase';
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

    // Buscar comentários principais e suas respostas
    const comments = await sql`
      WITH comment_tree AS (
        SELECT tc.*, 
               u.name as author_name,
               u.avatar_url as author_avatar,
               0 as level
        FROM task_comments tc
        JOIN users u ON tc.user_id = u.id
        WHERE tc.task_id = ${taskId} AND tc.parent_id IS NULL
        
        UNION ALL
        
        SELECT tc.*, 
               u.name as author_name,
               u.avatar_url as author_avatar,
               ct.level + 1 as level
        FROM task_comments tc
        JOIN users u ON tc.user_id = u.id
        JOIN comment_tree ct ON tc.parent_id = ct.id
        WHERE tc.task_id = ${taskId}
      )
      SELECT * FROM comment_tree
      ORDER BY 
        CASE WHEN parent_id IS NULL THEN created_at END DESC,
        CASE WHEN parent_id IS NOT NULL THEN created_at END ASC
    `;

    // Organizar comentários em estrutura hierárquica
    const commentMap = new Map();
    const rootComments = [];

    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
      
      if (comment.parent_id === null) {
        rootComments.push(comment);
      }
    });

    comments.forEach(comment => {
      if (comment.parent_id !== null) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      }
    });

    return NextResponse.json(rootComments);
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
    const { content, parent_id } = await request.json();

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return new NextResponse('Conteúdo do comentário é obrigatório', { status: 400 });
    }

    // Verificar se parent_id é válido (se fornecido)
    if (parent_id) {
      const parentComment = await sql`
        SELECT id FROM task_comments 
        WHERE id = ${parent_id} AND task_id = ${taskId}
      `;
      
      if (parentComment.length === 0) {
        return new NextResponse('Comentário pai não encontrado', { status: 400 });
      }
    }

    const result = await sql`
      INSERT INTO task_comments (task_id, user_id, content, parent_id)
      VALUES (${taskId}, ${userId}, ${content.trim()}, ${parent_id || null})
      RETURNING *,
        (SELECT name FROM users WHERE id = ${userId}) as author_name,
        (SELECT avatar_url FROM users WHERE id = ${userId}) as author_avatar
    `;

    const newComment = result[0];
    newComment.replies = [];

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
