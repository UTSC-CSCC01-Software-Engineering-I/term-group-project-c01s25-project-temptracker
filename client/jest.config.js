const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "jsdom", // Required for testing React components
  transform: {
    ...tsJestTransformCfg,
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json", // Use a test-friendly tsconfig
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // Support @/ alias
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFiles: ["<rootDir>/.jest/env.ts"],
};
