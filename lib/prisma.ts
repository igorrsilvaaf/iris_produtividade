import { PrismaClient } from '@prisma/client';

// Declarando o tipo global para o PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

// Exportando uma instância única do PrismaClient para evitar múltiplas conexões em desenvolvimento
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Adicionar export default para compatibilidade com importações existentes
export default prisma;

// Definindo a variável global apenas em ambiente que não for produção
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 