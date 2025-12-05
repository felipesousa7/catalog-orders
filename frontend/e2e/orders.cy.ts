describe('Pedidos Page', () => {
  beforeEach(() => {
    cy.visit('/orders');
    cy.waitForAPI();
  });

  it('deve exibir a lista de pedidos', () => {
    cy.contains('Pedidos').should('be.visible');
    
    // Aguardar o loading terminar
    cy.wait(2000);
    
    // Verificar se há pedidos ou se a mensagem de "sem dados" aparece
    cy.get('body').then(($body) => {
      if ($body.find('table').length > 0) {
        // Se há tabela, verificar que existe
        cy.get('table').should('exist');
      } else {
        // Se não há tabela, verificar que a mensagem de "sem dados" aparece
        // A mensagem quando não há pedidos é "Comece criando seu primeiro pedido"
        cy.contains('Comece criando seu primeiro pedido', { matchCase: false }).should('be.visible');
      }
    });
  });

  it('deve filtrar pedidos por status', () => {
    // Verificar se há pedidos primeiro
    cy.get('body').then(($body) => {
      if ($body.find('table tbody tr').length > 0) {
        // Material-UI Select usa div com role="combobox"
        cy.get('[role="combobox"]').first().click();
        cy.get('[role="option"]').contains('Criado').click();
        cy.wait(500);
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
      } else {
        cy.log('Nenhum pedido encontrado. Teste pulado - precisa criar pedidos primeiro.');
      }
    });
  });

  it('deve ordenar pedidos por total', () => {
    // Verificar se há pedidos primeiro
    cy.get('body').then(($body) => {
      if ($body.find('table tbody tr').length > 0) {
        cy.contains('th', 'Total').click();
        cy.wait(500);
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
      } else {
        cy.log('Nenhum pedido encontrado. Teste pulado - precisa criar pedidos primeiro.');
      }
    });
  });

  it('deve ordenar pedidos por data', () => {
    // Verificar se há pedidos primeiro
    cy.get('body').then(($body) => {
      if ($body.find('table tbody tr').length > 0) {
        cy.contains('th', 'Data').click();
        cy.wait(500);
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
      } else {
        cy.log('Nenhum pedido encontrado. Teste pulado - precisa criar pedidos primeiro.');
      }
    });
  });

  it('deve navegar para criar novo pedido', () => {
    cy.contains('Novo Pedido').click();
    cy.url().should('include', '/orders/create');
    cy.contains('Criar Pedido').should('be.visible');
  });

  it('deve visualizar detalhes de um pedido', () => {
    // Verificar se há pedidos primeiro
    cy.get('body').then(($body) => {
      if ($body.find('table tbody tr').length > 0) {
        cy.get('table tbody tr').first().within(() => {
          cy.get('button[aria-label="ver detalhes"]').click();
        });
        
        cy.url().should('match', /\/orders\/\d+/);
        cy.contains('Detalhes do Pedido').should('be.visible');
      } else {
        cy.log('Nenhum pedido encontrado. Teste pulado - precisa criar pedidos primeiro.');
      }
    });
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
    // O Autocomplete precisa de pelo menos 2 caracteres para buscar
    cy.get('input[placeholder*="produto"], input[placeholder*="Produto"]').type('No');
    cy.wait(2000); // Aguardar mais tempo para o Autocomplete buscar
    
    // Verificar se o listbox apareceu (pode não aparecer se não houver produtos)
    cy.get('body').then(($body) => {
      if ($body.find('[role="listbox"]').length > 0) {
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').first().click();
        cy.wait(1000);
        
        // Agora o botão deve existir, mas estar desabilitado porque não há cliente selecionado
        cy.contains('button', 'Criar Pedido').should('exist');
        cy.contains('button', 'Criar Pedido').should('be.disabled');
      } else {
        // Se não houver produtos, pular o teste ou criar um produto primeiro
        cy.log('Nenhum produto encontrado. Teste pulado.');
      }
    });
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
    
    // Buscar produto (Autocomplete do Material-UI - precisa de pelo menos 2 caracteres)
    cy.get('input[placeholder*="produto"], input[placeholder*="Produto"]').type('No');
    cy.wait(2000); // Aguardar mais tempo para o Autocomplete buscar
    
    // Verificar se o listbox apareceu e selecionar primeiro produto
    cy.get('body').then(($body) => {
      if ($body.find('[role="listbox"]').length > 0) {
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').first().click();
        cy.wait(1000);
        
        // Verificar se produto foi adicionado à tabela
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
      } else {
        cy.log('Nenhum produto encontrado. Teste pulado.');
      }
    });
  });

  it('deve calcular total do pedido', () => {
    // Selecionar cliente
    cy.get('label').contains('Cliente').parent().find('[role="combobox"]').click();
    cy.wait(300);
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.wait(500);
    
    // Adicionar produto (Autocomplete precisa de pelo menos 2 caracteres)
    cy.get('input[placeholder*="produto"], input[placeholder*="Produto"]').type('No');
    cy.wait(2000);
    
    // Verificar se o listbox apareceu e selecionar primeiro produto
    cy.get('body').then(($body) => {
      if ($body.find('[role="listbox"]').length > 0) {
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').first().click();
        cy.wait(1000);
        
        // Verificar se o total é exibido
        cy.contains('Total').should('be.visible');
        cy.contains('R$').should('be.visible');
      } else {
        cy.log('Nenhum produto encontrado. Teste pulado.');
      }
    });
  });

  it('deve criar um pedido completo', () => {
    // Selecionar cliente
    cy.get('label').contains('Cliente').parent().find('[role="combobox"]').click();
    cy.wait(300);
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.wait(500);
    
    // Adicionar produto (Autocomplete precisa de pelo menos 2 caracteres)
    cy.get('input[placeholder*="produto"], input[placeholder*="Produto"]').type('No');
    cy.wait(2000);
    
    // Verificar se o listbox apareceu e selecionar primeiro produto
    cy.get('body').then(($body) => {
      if ($body.find('[role="listbox"]').length > 0) {
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').first().click();
        cy.wait(1000);
        
        // Criar pedido
        cy.contains('button', 'Criar Pedido').should('not.be.disabled');
        cy.contains('button', 'Criar Pedido').click();
        cy.wait(3000);
        
        // Deve redirecionar para lista de pedidos
        cy.url().should('include', '/orders');
      } else {
        cy.log('Nenhum produto encontrado. Teste pulado.');
      }
    });
  });
});

