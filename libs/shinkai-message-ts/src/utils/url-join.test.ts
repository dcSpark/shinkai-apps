import { urlJoin } from './url-join';

describe('url join', () => {
  const sharedExpectedValue = 'localhost:5555/api/v1/send';
  const cases = [
    {
      data: ['localhost:5555', 'api', 'v1/send'],
      expectedValue: sharedExpectedValue,
    },
    {
      data: ['localhost:5555/', '/api/', 'v1/send/'],
      expectedValue: sharedExpectedValue,
    },
    {
      data: ['localhost:5555///', 'api//', '/v1/send'],
      expectedValue: sharedExpectedValue,
    },
    {
      data: ['localhost:5555', 'api//', '//v1/send/'],
      expectedValue: sharedExpectedValue,
    },
    {
      data: ['localhost:5555', 'api//', '//v1/send?foo=bar/bar2'],
      expectedValue: `${sharedExpectedValue}?foo=bar/bar2`,
    },
    { data: ['localhost:5555', '/', ''], expectedValue: 'localhost:5555' },
    { data: ['localhost:5555'], expectedValue: 'localhost:5555' },
    {
      data: ['https://google.com/', 'auth/', 'foo'],
      expectedValue: 'https://google.com/auth/foo',
    },
  ];
  test.each(cases)(
    'should generate a valid url',
    async ({ data, expectedValue }) => {
      const url = urlJoin(...data);
      expect(url).toBe(expectedValue);
    },
  );
});
