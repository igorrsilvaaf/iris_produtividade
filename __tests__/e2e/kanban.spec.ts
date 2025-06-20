import { test, expect, Page } from '@playwright/test';


test.describe('Kanban Board E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await loginUser(page);
    
    await page.goto('/app/kanban');
    
    await page.waitForSelector('[data-column="backlog"]');
  });

  test('deve exibir todas as colunas do Kanban', async () => {
    await expect(page.locator('[data-column="backlog"]')).toBeVisible();
    await expect(page.locator('[data-column="planning"]')).toBeVisible();
    await expect(page.locator('[data-column="inProgress"]')).toBeVisible();
    await expect(page.locator('[data-column="validation"]')).toBeVisible();
    await expect(page.locator('[data-column="completed"]')).toBeVisible();
  });

  test('deve criar uma nova tarefa diretamente em uma coluna', async () => {
    await page.click('[data-column="backlog"] button.add-task-button');
    
    await page.fill('[data-column="backlog"] input.add-task-input', 'Nova Tarefa E2E');
    
    await page.click('[data-column="backlog"] button.submit-button');
    
    await expect(page.locator('text=Nova Tarefa E2E')).toBeVisible();
  });

  test('deve arrastar um card de uma coluna para outra', async () => {
    const backlogCards = await page.$$('[data-column="backlog"] [data-type="card"]');
    if (backlogCards.length === 0) {
      await page.click('[data-column="backlog"] button.add-task-button');
      await page.fill('[data-column="backlog"] input.add-task-input', 'Tarefa para Arrastar');
      await page.click('[data-column="backlog"] button.submit-button');
      
      await page.waitForSelector('text=Tarefa para Arrastar');
    }
    
    const card = await page.waitForSelector('[data-column="backlog"] [data-type="card"]');
    
    const cardTitle = await card.textContent();
    
    const targetColumn = await page.waitForSelector('[data-column="inProgress"]');
    
    const cardBoundingBox = await card.boundingBox();
    const targetBoundingBox = await targetColumn.boundingBox();
    
    if (cardBoundingBox && targetBoundingBox) {
      const startX = cardBoundingBox.x + cardBoundingBox.width / 2;
      const startY = cardBoundingBox.y + cardBoundingBox.height / 2;
      const endX = targetBoundingBox.x + targetBoundingBox.width / 2;
      const endY = targetBoundingBox.y + targetBoundingBox.height / 2;
      
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 10 }); // Movimento suave
      await page.mouse.up();
      
      await page.waitForTimeout(500);
      
      await expect(page.locator(`[data-column="inProgress"] :text("${cardTitle}")`)).toBeVisible();
      
      await page.reload();
      
      await page.waitForSelector('[data-column="inProgress"]');
      
      await expect(page.locator(`[data-column="inProgress"] :text("${cardTitle}")`)).toBeVisible();
    }
  });

  test('deve reordenar cards dentro da mesma coluna', async () => {
    const backlogCards = await page.$$('[data-column="backlog"] [data-type="card"]');
    if (backlogCards.length < 2) {
      await page.click('[data-column="backlog"] button.add-task-button');
      await page.fill('[data-column="backlog"] input.add-task-input', 'Primeira Tarefa');
      await page.click('[data-column="backlog"] button.submit-button');
      
      await page.waitForTimeout(500);
      
      await page.click('[data-column="backlog"] button.add-task-button');
      await page.fill('[data-column="backlog"] input.add-task-input', 'Segunda Tarefa');
      await page.click('[data-column="backlog"] button.submit-button');
      
      await page.waitForTimeout(500);
    }
    
    const cards = await page.$$('[data-column="backlog"] [data-type="card"]');
    if (cards.length >= 2) {
      const card1 = cards[0];
      const card2 = cards[1];
      
      const card1Title = await card1.textContent();
      const card2Title = await card2.textContent();
      
      const card1Box = await card1.boundingBox();
      const card2Box = await card2.boundingBox();
      
      if (card1Box && card2Box) {
        const startX = card1Box.x + card1Box.width / 2;
        const startY = card1Box.y + card1Box.height / 2;
        const endX = card2Box.x + card2Box.width / 2;
        const endY = card2Box.y + card2Box.height + 5; // Logo abaixo do segundo card
        
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 10 });
        await page.mouse.up();
        
        await page.waitForTimeout(500);
        
        const newCards = await page.$$('[data-column="backlog"] [data-type="card"]');
        const newFirstCardTitle = await newCards[0].textContent();
        const newSecondCardTitle = await newCards[1].textContent();
        
        expect(newFirstCardTitle).toContain(card2Title);
        expect(newSecondCardTitle).toContain(card1Title);
      }
    }
  });
  
  test('deve marcar uma tarefa como concluída ao mover para a coluna completed', async () => {
    await page.click('[data-column="inProgress"] button.add-task-button');
    await page.fill('[data-column="inProgress"] input.add-task-input', 'Tarefa para Concluir');
    await page.click('[data-column="inProgress"] button.submit-button');
    
    await page.waitForTimeout(500);
    
    const card = await page.waitForSelector('[data-column="inProgress"] [data-type="card"]:has-text("Tarefa para Concluir")');
    
    const targetColumn = await page.waitForSelector('[data-column="completed"]');
    
    const cardBox = await card.boundingBox();
    const targetBox = await targetColumn.boundingBox();
    
    if (cardBox && targetBox) {
      await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
      await page.mouse.up();
      
      await page.waitForTimeout(500);
      
      await expect(page.locator('[data-column="completed"] :text("Tarefa para Concluir")')).toBeVisible();
      
      await page.reload();
      await page.waitForSelector('[data-column="completed"]');
      
      await expect(page.locator('[data-column="completed"] :text("Tarefa para Concluir")')).toBeVisible();
    }
  });
});

async function loginUser(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'usuario.teste@exemplo.com');
  await page.fill('input[name="password"]', 'senha123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/app/inbox');
} 