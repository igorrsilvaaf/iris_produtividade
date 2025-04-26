/** @type {import('jest').Config} */
const config = {
  // Configuração de teste para incluir arquivos .ts, .tsx
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
  ],
  
  // Configuração de cobertura
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  
  // Caminhos para os módulos
  modulePaths: ['<rootDir>'],
  
  // Definição do ambiente do teste (jsdom para testes de navegador)
  testEnvironment: 'jest-environment-jsdom',

  // Mapeamento de módulos para testes
  moduleNameMapper: {
    // Mapeia os aliases do tsconfig.json
    '^@/(.*)$': '<rootDir>/$1',
    
    // Mapeia arquivos estáticos
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Transformações
  transform: {
    // Use babel-jest para arquivos js, jsx, ts, tsx
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Arquivos a serem executados antes dos testes
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Ignorar pastas ao buscar arquivos para teste
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],
  
  // Ignorar pastas ao transformar código
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

export default config; 