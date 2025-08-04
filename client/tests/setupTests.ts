import '@testing-library/jest-dom';

const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/act\(...\)/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});