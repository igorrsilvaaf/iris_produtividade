import prisma from "./prisma";

export interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  startDate: Date | null;
  expiresAt: Date | null;
  isExpired: boolean;
}

/**
 * Verifica o status do trial de um usuário
 */
export async function getTrialStatus(userId: string): Promise<TrialStatus> {
  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) },
      select: {
        trial_start_date: true,
        trial_expired: true,
      },
    });

    if (!user || !user.trial_start_date) {
      return {
        isActive: false,
        daysRemaining: 0,
        startDate: null,
        expiresAt: null,
        isExpired: true,
      };
    }

    const startDate = user.trial_start_date;
    const expiresAt = new Date(startDate);
    expiresAt.setDate(expiresAt.getDate() + 14); // 14 dias de trial

    const now = new Date();
    const timeDiff = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const isExpired = user.trial_expired || now > expiresAt;
    const isActive = !isExpired && daysRemaining > 0;

    return {
      isActive,
      daysRemaining: Math.max(0, daysRemaining),
      startDate,
      expiresAt,
      isExpired,
    };
  } catch (error) {
    console.error("Erro ao verificar status do trial:", error);
    return {
      isActive: false,
      daysRemaining: 0,
      startDate: null,
      expiresAt: null,
      isExpired: true,
    };
  }
}

/**
 * Marca o trial como expirado no banco de dados
 */
export async function expireTrial(userId: string): Promise<void> {
  try {
    await prisma.users.update({
      where: { id: parseInt(userId) },
      data: { trial_expired: true },
    });
  } catch (error) {
    console.error("Erro ao expirar trial:", error);
  }
}

/**
 * Verifica se o usuário tem acesso às funcionalidades premium
 */
export async function hasAccess(userId: string): Promise<boolean> {
  const trialStatus = await getTrialStatus(userId);

  // TODO: Adicionar verificação de assinatura paga quando implementada
  // Por enquanto, só verifica o trial
  return trialStatus.isActive;
}

/**
 * Formata os dias restantes para exibição
 */
export function formatDaysRemaining(daysRemaining: number): string {
  if (daysRemaining <= 0) {
    return "Trial expirado";
  }

  if (daysRemaining === 1) {
    return "1 dia restante";
  }

  return `${daysRemaining} dias restantes`;
}
