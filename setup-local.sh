#!/bin/bash

# Script de configuração automática para ambiente local - Íris Produtividade
# Uso: ./setup-local.sh

set -e

echo "🚀 Configurando ambiente local do Íris Produtividade..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
print_status "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado. Instale a versão 18 ou superior."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versão $NODE_VERSION não é compatível. Instale a versão 18 ou superior."
    exit 1
fi

print_success "Node.js $(node --version) encontrado"

# Verificar se PostgreSQL está instalado
print_status "Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL não está instalado. Instale o PostgreSQL antes de continuar."
    exit 1
fi

print_success "PostgreSQL encontrado"

# Verificar se o serviço PostgreSQL está rodando
print_status "Verificando se PostgreSQL está rodando..."
if ! pg_isready -q; then
    print_warning "PostgreSQL não está rodando. Tentando iniciar..."
    
    # Tentar iniciar o PostgreSQL (funciona na maioria dos sistemas Linux)
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
    elif command -v service &> /dev/null; then
        sudo service postgresql start
    else
        print_error "Não foi possível iniciar o PostgreSQL automaticamente. Inicie manualmente."
        exit 1
    fi
    
    # Verificar novamente
    if ! pg_isready -q; then
        print_error "PostgreSQL não está respondendo. Verifique a instalação."
        exit 1
    fi
fi

print_success "PostgreSQL está rodando"

# Instalar dependências
print_status "Instalando dependências..."
if command -v pnpm &> /dev/null; then
    pnpm install
else
    npm install
fi

print_success "Dependências instaladas"

# Configurar arquivo .env.local
print_status "Configurando arquivo .env.local..."

if [ -f ".env.local" ]; then
    print_warning "Arquivo .env.local já existe. Fazendo backup..."
    cp .env.local .env.local.backup
fi

# Gerar chave secreta
SECRET_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Solicitar informações do banco de dados
echo
print_status "Configuração do banco de dados:"
read -p "Digite o usuário do PostgreSQL [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -s -p "Digite a senha do PostgreSQL: " DB_PASSWORD
echo

read -p "Digite o host do PostgreSQL [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Digite a porta do PostgreSQL [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Digite o nome do banco de dados [iris_produtividade_dev]: " DB_NAME
DB_NAME=${DB_NAME:-iris_produtividade_dev}

# Criar banco de dados se não existir
print_status "Criando banco de dados '$DB_NAME'..."
if PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_warning "Banco de dados '$DB_NAME' já existe"
else
    PGPASSWORD="$DB_PASSWORD" createdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME"
    print_success "Banco de dados '$DB_NAME' criado"
fi

# Criar arquivo .env.local
cat > .env.local << EOF
# ===========================================
# CONFIGURAÇÃO DO AMBIENTE LOCAL
# ===========================================

# Ambiente de desenvolvimento
NODE_ENV=development

# ===========================================
# BANCO DE DADOS
# ===========================================
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

# ===========================================
# AUTENTICAÇÃO (NextAuth)
# ===========================================
NEXTAUTH_SECRET="$SECRET_KEY"

# URL base da aplicação (para desenvolvimento local)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ===========================================
# EMAIL (OPCIONAL - para funcionalidade de reset de senha)
# ===========================================
# Se não configurar, o sistema funcionará sem emails
# EMAIL_SERVER_HOST="smtp.gmail.com"
# EMAIL_SERVER_PORT="587"
# EMAIL_SERVER_USER="seu_email@gmail.com"
# EMAIL_SERVER_PASSWORD="sua_senha_de_app"
# EMAIL_FROM="seu_email@gmail.com"
# EMAIL_SERVER_SECURE="false"
EOF

print_success "Arquivo .env.local criado"

# Configurar Prisma
print_status "Configurando Prisma..."
npx prisma generate

print_status "Executando migrações do banco de dados..."
npx prisma migrate dev --name init

print_success "Prisma configurado e migrações executadas"

# Perguntar se quer iniciar o servidor
echo
read -p "Deseja iniciar o servidor de desenvolvimento agora? [y/N]: " START_SERVER

if [[ $START_SERVER =~ ^[Yy]$ ]]; then
    print_status "Iniciando servidor de desenvolvimento..."
    echo
    print_success "Configuração concluída! O servidor está iniciando..."
    print_status "Acesse http://localhost:3000 para usar a aplicação"
    print_status "Pressione Ctrl+C para parar o servidor"
    echo
    
    if command -v pnpm &> /dev/null; then
        pnpm dev
    else
        npm run dev
    fi
else
    echo
    print_success "Configuração concluída!"
    print_status "Para iniciar o servidor, execute: npm run dev"
    print_status "Acesse http://localhost:3000 para usar a aplicação"
fi 