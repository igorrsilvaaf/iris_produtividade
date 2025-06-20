process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/testdb"; // Adicionar URL dummy

// Importa as extensões do Jest para o DOM
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Mock do ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock da função global fetch
global.fetch = jest.fn();

// Mock do objeto window.matchMedia para testes
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
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

// Mock de funções do DOM que podem não estar disponíveis no ambiente de teste
Object.defineProperty(window, "scrollTo", {
  value: () => {},
  writable: true,
});

// Mock do IntersectionObserver
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = IntersectionObserverMock;
