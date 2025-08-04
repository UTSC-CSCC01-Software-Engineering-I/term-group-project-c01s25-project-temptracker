const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom', // Required for testing React components
  transform: {
    ...tsJestTransformCfg,
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json', // Use a test-friendly tsconfig
      diagnostics: true,
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Support @/ alias
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/.jest/env.ts'], // Existing env setup
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'], // Add for jest-dom and act suppression
};