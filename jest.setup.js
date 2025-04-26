// Importa as extensões do Jest para o DOM
import '@testing-library/jest-dom';

// Mock da função global fetch
global.fetch = jest.fn();

// Mock do objeto window.matchMedia para testes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suprimir mensagens de erro de console durante os testes
console.error = jest.fn();
console.warn = jest.fn(); 