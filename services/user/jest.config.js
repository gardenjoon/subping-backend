/* eslint-disable max-len */
module.exports = {
  resetMocks: true,
  maxWorkers: 1,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/__test__/**/*.[jt]s?(x)',
    '!**/__test__/coverage/**',
    '!**/__test__/utils/**',
    '!**/__test__/images/**',
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ],
};