import matchers from '@testing-library/jest-dom/matchers';
import { beforeAll } from 'vitest';

// Runs once before each and every test suite.
beforeAll(async () => {
  expect.extend(matchers);
  global.BigInt.prototype.toJSON = function () {return this.toString()};
});

