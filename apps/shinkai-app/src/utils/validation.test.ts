import { test } from 'vitest';
import { validateInboxName } from './validation';

test('Validates inbox names correctly', () => {
  expect(validateInboxName("part1|part2::part3|part4::part5|part6::true")).toBe(true);
  expect(validateInboxName("part1|part2::part3::part4::false")).toBe(false);
  expect(validateInboxName("part1|part2::part3|part4::part5|part6::maybe")).toBe(false);
  expect(validateInboxName("part1|part2|part3|part4::part5|part6::true")).toBe(false);
  expect(validateInboxName("part1::part2|part3::part4|part5|part6::false")).toBe(false);
});
