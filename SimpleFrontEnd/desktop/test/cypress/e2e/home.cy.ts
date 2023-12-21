// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

// ** This file is an example of how to write Cypress tests, you can safely delete it **

// This test will pass when run against a clean Quasar project


describe('Landing', () => {
  beforeEach(() => {
    cy.login(); 
    cy.visit('/#');
    cy.wait(1000)
  });
  it('Should go To app', () => {
    cy.title().should('include', 'Opportunities');
    
    cy.visit('/#/app');
    cy.get('#pair-chart').should('exist');
  
  });    
});

describe('Alert Panels', ()=>{
  beforeEach(() => {
    cy.login(); 
    cy.visit('/#/app');
    cy.wait(1000)
  });
  it('Should display alert panel', ()=>{
    
      // cy.visit('/#/app');
  
      cy.get("#navMenuDrawer-toggleButton").click();
      cy.get("#navMenu-alertPanel-link").click();
      cy.get("#rsiThresholdPanel-toggleButton").click();
  })
})

export { };

