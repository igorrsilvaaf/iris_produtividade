import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    
    const users = await prisma.users.findMany({
      select: { id: true }
    });

    let notificationsCreated = 0;

    for (const user of users) {
      const existingRecord = await prisma.task_notifications_read.findFirst({
        where: { user_id: user.id }
      });

      if (!existingRecord) {
        await prisma.task_notifications_read.create({
          data: {
            user_id: user.id,
            last_read_at: new Date()
          }
        });
        notificationsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migração concluída. Registros criados: ${notificationsCreated}/${users.length}`,
      notificationsCreated,
      totalUsers: users.length
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro na migração' },
      { status: 500 }
    );
  }
} 