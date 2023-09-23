import { getDescription } from '../support/app.po';

describe('shinkai-app', () => {
  beforeEach(() => cy.visit('/connect'));

  it('should display app description', () => {
    // Function helper example, see `../support/app.po.ts` file
    getDescription().should('have.text', 'AI AGENT OS THAT UNLOCKS THE POTENTIAL OF LLMs');
  });
});
