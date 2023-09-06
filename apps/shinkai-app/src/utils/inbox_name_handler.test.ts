import { assert, suite } from 'vitest';
import { extractReceiverShinkaiName, getOtherPersonIdentity, ShinkaiNameError } from './inbox_name_handler';

suite('extractReceiverShinkaiName', () => {
  test('returns correct receiver name', () => {
    const result = extractReceiverShinkaiName(
      'inbox::@@node1.shinkai/main::@@node1.shinkai/main/device/main_device::false',
      '@@node1.shinkai'
    );
    assert.equal(result, '@@node1.shinkai', 'Returned the correct receiver name');
  });

  test('throws error for invalid format (too few parts)', () => {
    assert.throws(() => {
      extractReceiverShinkaiName('inbox::@@node1.shinkai', '@@node1.shinkai');
    }, ShinkaiNameError, 'InvalidFormat');
  });

  test('throws error for invalid format (too many parts)', () => {
    assert.throws(() => {
      extractReceiverShinkaiName('inbox::' + '@@node1.shinkai::'.repeat(100), '@@node1.shinkai');
    }, ShinkaiNameError, 'InvalidFormat');
  });

  test('throws error for invalid format (regex mismatch)', () => {
    assert.throws(() => {
      extractReceiverShinkaiName('inbox::@@invalid_node/main::@@node1.shinkai/main/device/main_device::false', '@@node1.shinkai');
    }, ShinkaiNameError, 'InvalidFormat');
  });
});

describe('getOtherPersonIdentity', () => {
  it('should return the other person identity', () => {
    const inboxName = 'inbox::@@node1.shinkai/main::@@node1.shinkai/main/device/main_device::false';
    const myIdentity = '@@node1.shinkai/main/device/main_device';
    const expectedIdentity = '@@node1.shinkai/main';

    const result = getOtherPersonIdentity(inboxName, myIdentity);

    expect(result).toBe(expectedIdentity);
  });

  it('should return empty string if no other identity is found', () => {
    const inboxName = 'inbox::@@node1.shinkai/main/device/main_device::false';
    const myIdentity = '@@node1.shinkai/main/device/main_device';

    const result = getOtherPersonIdentity(inboxName, myIdentity);

    expect(result).toBe(undefined);
  });
});