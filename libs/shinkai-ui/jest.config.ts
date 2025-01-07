/* eslint-disable */
export default {
  displayName: 'shinkai-ui',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/shinkai-ui',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    '^@shinkai_network/(.*)$': '<rootDir>/../../libs/$1/src',
  },
  testEnvironment: 'jsdom',
}; 