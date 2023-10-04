describe('shinkai-visor', () => {
  // This app is an extension so we navigate to the popup entry point (loaded in chrome when user click the extension icon)
  beforeEach(() => cy.visit('/src/components/popup/popup.html'));

  it('should display shinkai-logo', () => {
    cy.getDataCy('shinkai-logo').should('exist');
  });
});
