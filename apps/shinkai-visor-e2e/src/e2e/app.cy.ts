import { getWelcomeMessage } from '../support/app.po';

describe('shinkai-visor', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getWelcomeMessage().should('exist').contains('Setup Shinkai Visor to transform your web browser into a first class Shinkai client');
  });
});
