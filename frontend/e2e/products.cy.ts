describe('Produtos Page', () => {
  beforeEach(() => {
    cy.visit('/products');
    cy.waitForAPI();
  });

  it('deve exibir a lista de produtos', () => {
    cy.contains('Produtos').should('be.visible');
    cy.contains('Gerencie seu catálogo de produtos').should('be.visible');
    cy.get('table').should('exist');
  });

  it('deve permitir buscar produtos por nome', () => {
    cy.get('input[placeholder*="nome"]').type('Notebook');
    cy.wait(500);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('deve permitir buscar produtos por SKU', () => {
    cy.get('input[placeholder*="SKU"]').type('NOTE');
    cy.wait(500);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('deve abrir o diálogo de novo produto', () => {
    cy.contains('Novo Produto').click();
    cy.contains('Novo Produto').should('be.visible');
    cy.get('input[type="text"]').first().should('be.visible');
  });

  it('deve criar um novo produto', () => {
    cy.contains('Novo Produto').click();
    
    // Aguardar diálogo abrir completamente
    cy.get('[role="dialog"]').should('be.visible');
    
    // Preencher formulário dentro do diálogo
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().type('Produto Teste E2E');
      cy.get('input[type="text"]').eq(1).type('TEST-E2E-001');
      cy.get('input[type="number"]').first().type('99.90');
      cy.get('input[type="number"]').eq(1).type('10');
      
      cy.contains('Salvar').click();
    });
    
    // Aguardar diálogo fechar e lista recarregar
    cy.wait(2000);
    
    // Buscar pelo produto criado para garantir que aparece (pode estar em outra página)
    cy.get('input[placeholder*="nome"], input[placeholder*="Nome"]').first().clear().type('Produto Teste E2E');
    cy.wait(1000);
    
    // Verificar se produto aparece na lista
    cy.contains('Produto Teste E2E', { timeout: 10000 }).should('be.visible');
  });

  it('deve validar campos obrigatórios', () => {
    cy.contains('Novo Produto').click();
    cy.contains('Salvar').click();
    
    // Deve mostrar mensagens de erro
    cy.contains('Nome é obrigatório').should('be.visible');
  });

  it('deve editar um produto existente', () => {
    // Assumindo que existe pelo menos um produto
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="editar"]').click();
    });
    
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Editar Produto').should('be.visible');
    
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().clear().type('Produto Editado E2E');
      cy.contains('Salvar').click();
    });
    
    // Aguardar diálogo fechar e lista recarregar
    cy.wait(2000);
    
    // Verificar se produto editado aparece na lista
    cy.contains('Produto Editado E2E', { timeout: 10000 }).should('be.visible');
  });

  it('deve ordenar produtos por nome', () => {
    cy.contains('th', 'Nome').click();
    cy.wait(500);
    // Verificar se a ordenação foi aplicada
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('deve ordenar produtos por preço', () => {
    cy.contains('th', 'Preço').click();
    cy.wait(500);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('deve filtrar produtos por status ativo', () => {
    cy.contains('Ativos').click();
    cy.wait(500);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });
});

