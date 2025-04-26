# To-Do-Ist

Um aplicativo de gerenciamento de tarefas com diversas funcionalidades.

## Testes

O projeto utiliza Jest e React Testing Library para os testes. As seguintes opções estão disponíveis:

### Executar testes

```bash
npm test
```

### Executar testes em modo watch

```bash
npm run test:watch
```

### Executar testes com cobertura

```bash
npm run test:coverage
```

### Meta de Cobertura de Código

O projeto tem como meta manter pelo menos 80% de cobertura de código para cada componente. Esta meta é aplicada a:

- Statements (Declarações)
- Branches (Ramificações)
- Functions (Funções)
- Lines (Linhas de código)

Atualmente, os componentes principais (Todo, TodoList e QuickAddTodo) atendem a essa meta para garantir que as funcionalidades principais da aplicação sejam testadas adequadamente.

### Execução de testes no fluxo de CI

Os testes são executados automaticamente antes do build quando você executa:

```bash
npm run build
```

Isso garante que o código não seja submetido para produção com falhas nos testes.

## Estrutura de testes

Os testes estão localizados na pasta `__tests__` e seguem a mesma estrutura dos componentes correspondentes:

- `__tests__/components`: Testes para os componentes da aplicação

## Adicionando novos testes

Para adicionar testes para um novo componente, crie um arquivo com o nome `NomeDoComponente.test.tsx` na pasta `__tests__/components`.

Exemplo:

```tsx
import { render, screen } from '@testing-library/react';
import { SeuComponente } from '@/components/SeuComponente';
import '@testing-library/jest-dom';

describe('Componente SeuComponente', () => {
  test('deve renderizar corretamente', () => {
    render(<SeuComponente />);
    expect(screen.getByText('Texto do componente')).toBeInTheDocument();
  });
});
```

## Mocks

Para componentes que possuem dependências como `useRouter`, `useToast` ou outras hooks, é necessário criar mocks dessas funcionalidades. Exemplos de como fazer isso podem ser vistos nos testes existentes.

### Dicas para atingir 80% de cobertura

Para atingir 80% de cobertura de código, siga estas práticas:

1. **Teste todos os caminhos condicionais**: Certifique-se de testar tanto o caminho positivo quanto o negativo de condicionais (if/else).
2. **Teste tratamento de erros**: Implemente testes que simulem falhas em operações como chamadas de API.
3. **Teste interações do usuário**: Utilize `fireEvent` para simular cliques, preenchimento de formulários e outras interações.
4. **Mock de dependências externas**: Utilize mocks para APIs, localStorage, hooks personalizados, etc.
5. **Teste diferentes estados de componente**: Verifique como o componente se comporta em diferentes estados (carregando, erro, sucesso). 