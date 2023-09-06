import { getDescription } from '../support/app.po';

describe('shinkai-app', () => {
  beforeEach(() => cy.visit('/'));

  it('should display app description', () => {
    // Function helper example, see `../support/app.po.ts` file
    getDescription().contains('AI AGENT OS THAT UNLOCKS THE POTENTIAL OF LLMS');
  });
});
