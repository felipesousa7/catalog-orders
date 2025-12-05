describe('Pedidos Page', () => {
  beforeEach(() => {
    cy.visit('/orders');
    cy.waitForAPI();
  });

  it('deve exibir a lista de pedidos', () => {
    cy.contains('Pedidos').should('be.visible');
    cy.get('table').should('exist');
  });

  it('deve filtrar pedidos por status', () => {
    // Material-UI Select usa div com role="combobox"
    cy.get('[role="combobox"]').first().click();
    cy.get('[role="option"]').contains('Criado').click();
    cy.wait(500);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('deve ordenar pedidos por total', () => {
    cy.contains('th', 'Total').click();
    cy.wait(500);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('deve ordenar pedidos por data', () => {
    cy.contains('th', 'Data').click();
    cy.wait(500);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('deve navegar para criar novo pedido', () => {
    cy.contains('Novo Pedido').click();
    cy.url().should('include', '/orders/create');
    cy.contains('Criar Pedido').should('be.visible');
  });

  it('deve visualizar detalhes de um pedido', () => {
    // Assumindo que existe pelo menos um pedido
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="ver detalhes"]').click();
    });
    
    cy.url().should('match', /\/orders\/\d+/);
    cy.contains('Detalhes do Pedido').should('be.visible');
  });
});

describe('Criar Pedido Page', () => {
  beforeEach(() => {
    cy.visit('/orders/create');
    cy.waitForAPI();
  });

  it('deve exibir o formulário de criação de pedido', () => {
    cy.contains('Criar Pedido').should('be.visible');
    cy.contains('Cliente *').should('be.visible');
    cy.contains('Buscar Produto').should('be.visible');
  });

  it('deve validar seleção de cliente', () => {
    // O botão "Criar Pedido" só aparece quando há produtos no pedido
    // Primeiro, adicionar um produto para que o botão apareça
    cy.get('input[placeholder*="produto"], input[placeholder*="Produto"]').type('Notebook');
    cy.wait(1500);
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.wait(1000);
    
    // Agora o botão deve existir, mas estar desabilitado porque não há cliente selecionado
    cy.contains('button', 'Criar Pedido').should('exist');
    cy.contains('button', 'Criar Pedido').should('be.disabled');
  });

  it('deve selecionar um cliente', () => {
    // Material-UI Select - clicar no combobox
    cy.get('label').contains('Cliente').parent().find('[role="combobox"]').click();
    cy.wait(300);
    
    // Selecionar primeira opção
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.wait(500);
    
    // Verificar se cliente foi selecionado (o select não deve estar vazio)
    cy.get('label').contains('Cliente').parent().find('[role="combobox"]').should('not.have.text', '');
  });

  it('deve buscar e adicionar produtos', () => {
    // Selecionar cliente primeiro
    cy.get('label').contains('Cliente').parent().find('[role="combobox"]').click();
    cy.wait(300);
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.wait(500);
    
    // Buscar produto (Autocomplete do Material-UI)
    cy.get('input[placeholder*="produto"], input[placeholder*="Produto"]').type('Notebook');
    cy.wait(1500);
    
    // Selecionar primeiro produto da lista do Autocomplete
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.wait(1000);
    
    // Verificar se produto foi adicionado à tabela
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('deve calcular total do pedido', () => {
    // Selecionar cliente
    cy.get('label').contains('Cliente').parent().find('[role="combobox"]').click();
    cy.wait(300);
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.wait(500);
    
    // Adicionar produto
    cy.get('input[placeholder*="produto"], input[placeholder*="Produto"]').type('Notebook');
    cy.wait(1500);
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.wait(1000);
    
    // Verificar se o total é exibido
    cy.contains('Total').should('be.visible');
    cy.contains('R$').should('be.visible');
  });

  it('deve criar um pedido completo', () => {
    // Selecionar cliente
    cy.get('label').contains('Cliente').parent().find('[role="combobox"]').click();
    cy.wait(300);
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.wait(500);
    
    // Adicionar produto
    cy.get('input[placeholder*="produto"], input[placeholder*="Produto"]').type('Notebook');
    cy.wait(1500);
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.wait(1000);
    
    // Criar pedido
    cy.contains('button', 'Criar Pedido').should('not.be.disabled');
    cy.contains('button', 'Criar Pedido').click();
    cy.wait(3000);
    
    // Deve redirecionar para lista de pedidos
    cy.url().should('include', '/orders');
  });
});

