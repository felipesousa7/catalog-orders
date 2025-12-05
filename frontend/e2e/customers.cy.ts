describe('Clientes Page', () => {
  beforeEach(() => {
    cy.visit('/customers');
    cy.waitForAPI();
  });

  it('deve exibir a lista de clientes', () => {
    cy.contains('Clientes').should('be.visible');
    cy.contains('Gerencie sua base de clientes').should('be.visible');
    cy.get('table').should('exist');
  });

  it('deve permitir buscar clientes por nome', () => {
    cy.get('input[placeholder*="nome"]').type('João');
    cy.wait(500);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('deve permitir buscar clientes por email', () => {
    cy.get('input[type="email"]').type('joao');
    cy.wait(500);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('deve abrir o diálogo de novo cliente', () => {
    cy.contains('Novo Cliente').click();
    cy.contains('Novo Cliente').should('be.visible');
    cy.get('input[type="text"]').first().should('be.visible');
  });

  it('deve criar um novo cliente', () => {
    cy.contains('Novo Cliente').click();
    
    // Aguardar diálogo abrir completamente
    cy.get('[role="dialog"]').should('be.visible');
    
    // Preencher formulário dentro do diálogo
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().type('Cliente Teste E2E');
      cy.get('input[type="email"]').type('teste.e2e@example.com');
      cy.get('input[type="text"]').last().type('12345678900');
      
      cy.contains('Salvar').click();
    });
    
    cy.wait(2000);
    
    cy.contains('Cliente Teste E2E').should('be.visible');
  });

  it('deve validar campos obrigatórios', () => {
    cy.contains('Novo Cliente').click();
    cy.contains('Salvar').click();
    
    // Deve mostrar mensagens de erro
    cy.contains('Nome é obrigatório').should('be.visible');
    cy.contains('Email é obrigatório').should('be.visible');
  });

  it('deve validar formato de email', () => {
    cy.contains('Novo Cliente').click();
    
    cy.get('[role="dialog"]').should('be.visible');
    
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="email"]').type('email-invalido');
      cy.contains('Salvar').click();
      
      cy.contains('Email inválido').should('be.visible');
    });
  });

  it('deve editar um cliente existente', () => {
    // Assumindo que existe pelo menos um cliente
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="editar"]').click();
    });
    
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Editar Cliente').should('be.visible');
    
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().clear().type('Cliente Editado E2E');
      cy.contains('Salvar').click();
    });
    
    cy.wait(2000);
    
    cy.contains('Cliente Editado E2E').should('be.visible');
  });

  it('deve ordenar clientes por nome', () => {
    cy.contains('th', 'Nome').click();
    cy.wait(500);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('deve ordenar clientes por email', () => {
    cy.contains('th', 'Email').click();
    cy.wait(500);
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });
});

