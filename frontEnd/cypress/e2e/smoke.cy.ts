describe('homepage smoke test', () => {
  it('loads without error', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });
});
