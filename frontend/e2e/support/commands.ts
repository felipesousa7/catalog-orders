/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to wait for API to be ready
       * @example cy.waitForAPI()
       */
      waitForAPI(): Chainable<void>;
      
      /**
       * Custom command to setup test data
       * @example cy.setupTestData()
       */
      setupTestData(): Chainable<void>;
    }
  }
}

// Wait for API to be ready
Cypress.Commands.add('waitForAPI', () => {
  cy.request({
    method: 'GET',
    url: 'http://localhost:8080/api/products',
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) {
      cy.wait(1000);
      cy.waitForAPI();
    }
  });
});

// Setup test data (optional - can be used to seed data)
Cypress.Commands.add('setupTestData', () => {
  // This can be used to setup test data if needed
  // For now, we'll rely on the seed data from the backend
});

export {};

