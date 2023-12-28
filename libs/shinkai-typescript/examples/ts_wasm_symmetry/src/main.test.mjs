const { run } = require('./main.js');

test('compare wrappedMessageValues and unsortedValues', async () => {
  const { wrappedMessageValues, unsortedValues } = await run();

  expect(wrappedMessageValues).toEqual(unsortedValues);
});