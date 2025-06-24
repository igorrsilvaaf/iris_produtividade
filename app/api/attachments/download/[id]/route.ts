import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== INICIANDO DOWNLOAD ===');
    console.log('Parâmetros recebidos:', { params });
    
    const session = await getSession();
    console.log('Sessão encontrada?', !!session);
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const attachmentId = parseInt(params.id, 10);
    
    if (isNaN(attachmentId)) {
      console.error('Invalid attachment ID format:', params.id);
      return new NextResponse(JSON.stringify({ error: "Invalid attachment ID format" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Buscando anexo no banco de dados...');
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          select: {
            id: true,
            user_id: true
          }
        }
      }
    });
    
    console.log('Anexo encontrado?', !!attachment);
    
    if (!attachment) {
      console.error('Attachment not found:', attachmentId);
      return new NextResponse(JSON.stringify({ error: "Attachment not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (attachment.task.user_id !== session.user.id) {
      console.error('Usuário não autorizado a acessar este anexo');
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Anexo encontrado:', {
      id: attachment.id,
      name: attachment.name,
      type: attachment.type,
      contentLength: attachment.content?.length || 0
    });

    // Verificar se é um link
    if (attachment.type === 'text/uri-list' || attachment.type === 'text/plain') {
      console.log('Redirecionando para URL:', attachment.content);
      return NextResponse.redirect(attachment.content);
    }

    // Para arquivos binários, converter de base64 para buffer
    const buffer = Buffer.from(attachment.content, 'base64');
    console.log('Buffer criado com tamanho:', buffer.length);

    // Criar headers com o nome do arquivo codificado corretamente
    const headers = new Headers();
    headers.set('Content-Type', attachment.type || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename*="UTF-8''${encodeURIComponent(attachment.name || `attachment-${attachmentId}`)}`);
    headers.set('Content-Length', buffer.length.toString());
    headers.set('Cache-Control', 'no-store, max-age=0');

    console.log('Headers configurados:', Object.fromEntries(headers.entries()));
    
    return new NextResponse(buffer, { 
      headers,
      // Garante que a resposta não seja armazenada em cache
      status: 200
    });
  } catch (error) {
    console.error('=== ERRO NO DOWNLOAD ===');
    console.error('Tipo do erro:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Mensagem:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: `Failed to download attachment: ${error instanceof Error ? error.message : String(error)}`
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        } 
      }
    );
  }
}
