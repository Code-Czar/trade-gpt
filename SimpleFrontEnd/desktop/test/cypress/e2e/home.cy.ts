
beforeEach(() => {
  cy.login(); 
  cy.visit('/');
});

describe('Landing', () => {
  it('Should go To app', () => {
    cy.title().should('include', 'Opportunities');
    
    cy.visit('/#/app');
    cy.get('#pair-chart').should('exist');
  
  });    
});

describe.only('Alert Panels', ()=>{
  it('Should display alert panel', ()=>{
    
      cy.visit('/#/app');
  
      cy.get("#navMenuDrawer-toggleButton").click();
      cy.get("#navMenu-alertPanel-link").click();
      cy.get("#rsiThresholdPanel-toggleButton").click();
  })
})

export { };

