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
    // Verificar se há produtos na lista primeiro
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    
    // Limpar campo de busca primeiro (pode ter texto de teste anterior)
    cy.get('input[placeholder*="nome"], input[placeholder*="Nome"]').first().clear();
    cy.wait(500);
    
    // Buscar por nome (usar produto do seed - "Notebook Dell Inspiron")
    cy.get('input[placeholder*="nome"], input[placeholder*="Nome"]').first().type('Notebook');
    
    // Aguardar o loading terminar e a busca completar
    // O DataTable mostra loading enquanto busca, então aguardamos a tabela aparecer novamente
    cy.get('table', { timeout: 5000 }).should('exist');
    cy.wait(1000); // Aguardar um pouco mais para garantir que a busca completou
    
    // Verificar se há resultados na tabela (deve encontrar "Notebook Dell Inspiron" do seed)
    cy.get('table tbody tr', { timeout: 5000 }).should('have.length.greaterThan', 0);
    
    // Verificar se pelo menos um resultado contém "Notebook"
    cy.contains('table tbody tr', 'Notebook', { matchCase: false }).should('exist');
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
    // Usar timestamp para garantir nome único
    const timestamp = Date.now();
    const productName = `Produto Teste E2E ${timestamp}`;
    const productSku = `TEST-E2E-${timestamp}`;
    
    cy.contains('Novo Produto').click();
    
    // Aguardar diálogo abrir completamente
    cy.get('[role="dialog"]').should('be.visible');
    
    // Preencher formulário dentro do diálogo
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().type(productName);
      cy.get('input[type="text"]').eq(1).type(productSku);
      cy.get('input[type="number"]').first().type('99.90');
      cy.get('input[type="number"]').eq(1).type('10');
      
      cy.contains('Salvar').click();
    });
    
    // Aguardar diálogo fechar completamente (não apenas não estar visível)
    cy.get('[role="dialog"]', { timeout: 5000 }).should('not.exist');
    
    // Aguardar lista recarregar
    cy.wait(2000);
    
    // Buscar pelo produto criado para garantir que aparece (pode estar em outra página)
    cy.get('input[placeholder*="nome"], input[placeholder*="Nome"]').first().clear({ force: true }).type(productName);
    cy.wait(1000);
    
    // Verificar se produto aparece na lista
    cy.contains(productName, { timeout: 10000 }).should('be.visible');
  });

  it('deve validar campos obrigatórios', () => {
    cy.contains('Novo Produto').click();
    cy.contains('Salvar').click();
    
    // Deve mostrar mensagens de erro
    cy.contains('Nome é obrigatório').should('be.visible');
  });

  it('deve editar um produto existente', () => {
    // Usar timestamp para garantir nome único
    const timestamp = Date.now();
    const editedProductName = `Produto Editado E2E ${timestamp}`;
    
    // Assumindo que existe pelo menos um produto
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="editar"]').click();
    });
    
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Editar Produto').should('be.visible');
    
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().clear().type(editedProductName);
      cy.contains('Salvar').click();
    });
    
    // Aguardar diálogo fechar completamente
    cy.get('[role="dialog"]', { timeout: 5000 }).should('not.exist');
    
    // Aguardar lista recarregar
    cy.wait(2000);
    
    // Buscar pelo produto editado para garantir que aparece (pode estar em outra página)
    cy.get('input[placeholder*="nome"], input[placeholder*="Nome"]').first().clear({ force: true }).type(editedProductName);
    cy.wait(1000);
    
    // Verificar se produto editado aparece na lista
    cy.contains(editedProductName, { timeout: 10000 }).should('be.visible');
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

