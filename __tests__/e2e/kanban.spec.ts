import { test, expect, Page } from '@playwright/test';

/**
 * Testes E2E para o Kanban usando Playwright
 * 
 * Importante: Para executar estes testes, você precisa:
 * 1. Instalar o Playwright: npm install --save-dev @playwright/test
 * 2. Configurar no playwright.config.ts (se não tiver, crie seguindo a documentação)
 * 3. Executar com: npx playwright test __tests__/e2e/kanban.spec.ts
 */

test.describe('Kanban Board E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // Criar um novo contexto para cada teste para ter uma sessão limpa
    const context = await browser.newContext();
    page = await context.newPage();

    // Fazer login antes de cada teste
    await loginUser(page);
    
    // Navegar para a página do Kanban
    await page.goto('/app/kanban');
    
    // Esperar pelo carregamento completo do board
    await page.waitForSelector('[data-column="backlog"]');
  });

  test('deve exibir todas as colunas do Kanban', async () => {
    // Verificar se todas as colunas estão presentes
    await expect(page.locator('[data-column="backlog"]')).toBeVisible();
    await expect(page.locator('[data-column="planning"]')).toBeVisible();
    await expect(page.locator('[data-column="inProgress"]')).toBeVisible();
    await expect(page.locator('[data-column="validation"]')).toBeVisible();
    await expect(page.locator('[data-column="completed"]')).toBeVisible();
  });

  test('deve criar uma nova tarefa diretamente em uma coluna', async () => {
    // Clicar no botão de adicionar tarefa na coluna Backlog
    await page.click('[data-column="backlog"] button.add-task-button');
    
    // Preencher o campo de título
    await page.fill('[data-column="backlog"] input.add-task-input', 'Nova Tarefa E2E');
    
    // Clicar no botão de adicionar
    await page.click('[data-column="backlog"] button.submit-button');
    
    // Verificar se a tarefa foi adicionada
    await expect(page.locator('text=Nova Tarefa E2E')).toBeVisible();
  });

  test('deve arrastar um card de uma coluna para outra', async () => {
    // Primeiro, garantir que existe pelo menos um card na coluna backlog
    // Se não existir, criar um
    const backlogCards = await page.$$('[data-column="backlog"] [data-type="card"]');
    if (backlogCards.length === 0) {
      // Criar uma tarefa para o teste
      await page.click('[data-column="backlog"] button.add-task-button');
      await page.fill('[data-column="backlog"] input.add-task-input', 'Tarefa para Arrastar');
      await page.click('[data-column="backlog"] button.submit-button');
      
      // Esperar a tarefa aparecer
      await page.waitForSelector('text=Tarefa para Arrastar');
    }
    
    // Identificar o card para arrastar (o primeiro da coluna backlog)
    const card = await page.waitForSelector('[data-column="backlog"] [data-type="card"]');
    
    // Obter o título do card para verificar depois
    const cardTitle = await card.textContent();
    
    // Simular drag and drop para a coluna inProgress
    const targetColumn = await page.waitForSelector('[data-column="inProgress"]');
    
    // Executar o drag and drop
    const cardBoundingBox = await card.boundingBox();
    const targetBoundingBox = await targetColumn.boundingBox();
    
    if (cardBoundingBox && targetBoundingBox) {
      // Posições de origem e destino
      const startX = cardBoundingBox.x + cardBoundingBox.width / 2;
      const startY = cardBoundingBox.y + cardBoundingBox.height / 2;
      const endX = targetBoundingBox.x + targetBoundingBox.width / 2;
      const endY = targetBoundingBox.y + targetBoundingBox.height / 2;
      
      // Executar o drag and drop
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 10 }); // Movimento suave
      await page.mouse.up();
      
      // Aguardar o processamento do movimento no servidor
      await page.waitForTimeout(500);
      
      // Verificar se o card agora está na coluna inProgress
      await expect(page.locator(`[data-column="inProgress"] :text("${cardTitle}")`)).toBeVisible();
      
      // Recarregar a página para verificar se a posição persiste
      await page.reload();
      
      // Esperar pelo carregamento do board
      await page.waitForSelector('[data-column="inProgress"]');
      
      // Verificar se o card ainda está na coluna inProgress após o reload
      await expect(page.locator(`[data-column="inProgress"] :text("${cardTitle}")`)).toBeVisible();
    }
  });

  test('deve reordenar cards dentro da mesma coluna', async () => {
    // Primeiro, garantir que existem pelo menos dois cards na coluna backlog
    // Se não existirem, criar
    const backlogCards = await page.$$('[data-column="backlog"] [data-type="card"]');
    if (backlogCards.length < 2) {
      // Criar duas tarefas para o teste
      await page.click('[data-column="backlog"] button.add-task-button');
      await page.fill('[data-column="backlog"] input.add-task-input', 'Primeira Tarefa');
      await page.click('[data-column="backlog"] button.submit-button');
      
      await page.waitForTimeout(500);
      
      await page.click('[data-column="backlog"] button.add-task-button');
      await page.fill('[data-column="backlog"] input.add-task-input', 'Segunda Tarefa');
      await page.click('[data-column="backlog"] button.submit-button');
      
      await page.waitForTimeout(500);
    }
    
    // Identificar os dois primeiros cards da coluna
    const cards = await page.$$('[data-column="backlog"] [data-type="card"]');
    if (cards.length >= 2) {
      const card1 = cards[0];
      const card2 = cards[1];
      
      // Obter títulos para verificação
      const card1Title = await card1.textContent();
      const card2Title = await card2.textContent();
      
      // Arrastar o primeiro card para posição do segundo
      const card1Box = await card1.boundingBox();
      const card2Box = await card2.boundingBox();
      
      if (card1Box && card2Box) {
        // Posições para o drag and drop
        const startX = card1Box.x + card1Box.width / 2;
        const startY = card1Box.y + card1Box.height / 2;
        const endX = card2Box.x + card2Box.width / 2;
        const endY = card2Box.y + card2Box.height + 5; // Logo abaixo do segundo card
        
        // Executar o drag and drop
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 10 });
        await page.mouse.up();
        
        // Aguardar o processamento
        await page.waitForTimeout(500);
        
        // Verificar a nova ordem dos cards
        const newCards = await page.$$('[data-column="backlog"] [data-type="card"]');
        const newFirstCardTitle = await newCards[0].textContent();
        const newSecondCardTitle = await newCards[1].textContent();
        
        // Verificar se a ordem mudou
        expect(newFirstCardTitle).toContain(card2Title);
        expect(newSecondCardTitle).toContain(card1Title);
      }
    }
  });
  
  test('deve marcar uma tarefa como concluída ao mover para a coluna completed', async () => {
    // Criar uma tarefa na coluna inProgress
    await page.click('[data-column="inProgress"] button.add-task-button');
    await page.fill('[data-column="inProgress"] input.add-task-input', 'Tarefa para Concluir');
    await page.click('[data-column="inProgress"] button.submit-button');
    
    await page.waitForTimeout(500);
    
    // Identificar o card criado
    const card = await page.waitForSelector('[data-column="inProgress"] [data-type="card"]:has-text("Tarefa para Concluir")');
    
    // Simular drag and drop para a coluna completed
    const targetColumn = await page.waitForSelector('[data-column="completed"]');
    
    const cardBox = await card.boundingBox();
    const targetBox = await targetColumn.boundingBox();
    
    if (cardBox && targetBox) {
      // Executar o drag and drop
      await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
      await page.mouse.up();
      
      // Aguardar o processamento
      await page.waitForTimeout(500);
      
      // Verificar se o card está na coluna completed
      await expect(page.locator('[data-column="completed"] :text("Tarefa para Concluir")')).toBeVisible();
      
      // Recarregar e verificar persistência
      await page.reload();
      await page.waitForSelector('[data-column="completed"]');
      
      // Verificar se ainda está na coluna completed
      await expect(page.locator('[data-column="completed"] :text("Tarefa para Concluir")')).toBeVisible();
    }
  });
});

/**
 * Função auxiliar para fazer login
 */
async function loginUser(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'usuario.teste@exemplo.com');
  await page.fill('input[name="password"]', 'senha123');
  await page.click('button[type="submit"]');
  
  // Esperar pela navegação bem-sucedida (URL da dashboard)
  await page.waitForURL('**/app/inbox');
} 