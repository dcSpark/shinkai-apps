import { InboxName } from '../src/schemas/inbox_name';

describe('InboxName', () => {
  test('valid_inbox_names', () => {
    const validNames = [
      'inbox::@@node.shinkai::true',
      'inbox::@@node1.shinkai/subidentity::false',
      'inbox::@@alice.shinkai/profileName/agent/myChatGPTAgent::true',
      'inbox::@@alice.shinkai/profileName/device/myPhone::true',
      'inbox::@@node1.shinkai/subidentity::@@node2.shinkai/subidentity2::false',
      'inbox::@@node1.shinkai/subidentity::@@node2.shinkai/subidentity::@@node3.shinkai/subidentity2::false',
      // add other valid examples here...
    ];

    for (const name of validNames) {
      expect(() => InboxName.parseInboxName(name)).not.toThrow();
    }
  });

  test('invalid_inbox_names', () => {
    const invalidNames = [
      '@@node1.shinkai::false',
      'inbox::@@node1.shinkai::falsee',
      '@@node1.shinkai',
      'inbox::@@node1.shinkai',
      'inbox::node1::false',
      'inbox::node1.shinkai::false',
      'inbox::@@node1::false',
      'inbox::@@node1.shinkai//subidentity::@@node2.shinkai::false',
      'inbox::@@node1/subidentity::false',
      // add other invalid examples here...
    ];

    for (const name of invalidNames) {
      expect(() => InboxName.parseInboxName(name)).toThrow();
    }
  });

  // Add other tests here...
});
