// Zero-dependency Test Harness for Raider Station E2E Test Suite

export class TestRunner {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.results = [];
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeEachFns: [],
      afterEachFns: [],
      beforeAllFns: [],
      afterAllFns: [],
    };
    this.suites.push(suite);
    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = prevSuite;
    }
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEachFns.push(fn);
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEachFns.push(fn);
    }
  }

  beforeAll(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeAllFns.push(fn);
    }
  }

  afterAll(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterAllFns.push(fn);
    }
  }

  it(name, fn) {
    if (!this.currentSuite) {
      throw new Error(`Test "${name}" must be within a describe() block`);
    }
    this.currentSuite.tests.push({ name, fn });
  }

  async run(filterOptions = {}) {
    const startTime = Date.now();
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.results = [];

    const tierFilter = filterOptions.tier ? String(filterOptions.tier) : null;
    const matchFilter = filterOptions.match ? new RegExp(filterOptions.match, "i") : null;

    console.log("\n=======================================================");
    console.log(" 🧪 Raider Station E2E & Contract Test Runner");
    console.log("=======================================================\n");

    for (const suite of this.suites) {
      if (tierFilter && !suite.name.toLowerCase().includes(`tier ${tierFilter}`) && !suite.name.toLowerCase().includes(`tier${tierFilter}`)) {
        continue;
      }
      if (matchFilter && !matchFilter.test(suite.name)) {
        continue;
      }

      console.log(`\x1b[1m\x1b[36m▶ Suite: ${suite.name}\x1b[0m`);

      for (const beforeAllFn of suite.beforeAllFns) {
        await beforeAllFn();
      }

      for (const test of suite.tests) {
        if (matchFilter && !matchFilter.test(test.name)) {
          this.skipped++;
          continue;
        }

        for (const beforeEachFn of suite.beforeEachFns) {
          await beforeEachFn();
        }

        const testStart = Date.now();
        try {
          await test.fn();
          const duration = Date.now() - testStart;
          this.passed++;
          console.log(`  \x1b[32m✔\x1b[0m ${test.name} \x1b[90m(${duration}ms)\x1b[0m`);
          this.results.push({ suite: suite.name, test: test.name, status: "PASS", duration });
        } catch (err) {
          const duration = Date.now() - testStart;
          this.failed++;
          console.log(`  \x1b[31m✖\x1b[0m ${test.name} \x1b[90m(${duration}ms)\x1b[0m`);
          console.log(`    \x1b[31mError: ${err.message}\x1b[0m`);
          if (err.stack) {
            const stackLines = err.stack.split("\n").slice(1, 4).join("\n");
            console.log(`    \x1b[90m${stackLines}\x1b[0m`);
          }
          this.results.push({ suite: suite.name, test: test.name, status: "FAIL", duration, error: err.message });
        }

        for (const afterEachFn of suite.afterEachFns) {
          await afterEachFn();
        }
      }

      for (const afterAllFn of suite.afterAllFns) {
        await afterAllFn();
      }

      console.log("");
    }

    const totalDuration = Date.now() - startTime;
    const totalTests = this.passed + this.failed;

    console.log("=======================================================");
    console.log(` 📊 Test Execution Summary (${totalDuration}ms)`);
    console.log(`    Total:   ${totalTests}`);
    console.log(`    Passed:  \x1b[32m${this.passed}\x1b[0m`);
    console.log(`    Failed:  ${this.failed > 0 ? `\x1b[31m${this.failed}\x1b[0m` : `0`}`);
    if (this.skipped > 0) {
      console.log(`    Skipped: \x1b[33m${this.skipped}\x1b[0m`);
    }
    console.log("=======================================================\n");

    return {
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
      total: totalTests,
      duration: totalDuration,
      results: this.results,
    };
  }
}

// Global runner instance
export const runner = new TestRunner();
export const describe = (name, fn) => runner.describe(name, fn);
export const it = (name, fn) => runner.it(name, fn);
export const beforeEach = (fn) => runner.beforeEach(fn);
export const afterEach = (fn) => runner.afterEach(fn);
export const beforeAll = (fn) => runner.beforeAll(fn);
export const afterAll = (fn) => runner.afterAll(fn);

// Rich Assertions Library
export const expect = (actual) => {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} (${typeof expected}) but got ${JSON.stringify(actual)} (${typeof actual})`);
      }
    },
    toEqual(expected) {
      const actJson = JSON.stringify(actual);
      const expJson = JSON.stringify(expected);
      if (actJson !== expJson) {
        throw new Error(`Expected deep equality:\n  Expected: ${expJson}\n  Received: ${actJson}`);
      }
    },
    toBeCloseTo(expected, precision = 2) {
      const diff = Math.abs(actual - expected);
      const tolerance = Math.pow(10, -precision) / 2;
      if (diff > tolerance) {
        throw new Error(`Expected ${actual} to be close to ${expected} within precision ${precision}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${JSON.stringify(actual)}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value but got ${JSON.stringify(actual)}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined but got undefined`);
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected undefined but got ${JSON.stringify(actual)}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
      }
    },
    toContain(item) {
      if (Array.isArray(actual)) {
        if (!actual.includes(item)) {
          throw new Error(`Expected array ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
        }
      } else if (typeof actual === "string") {
        if (!actual.includes(item)) {
          throw new Error(`Expected string "${actual}" to contain "${item}"`);
        }
      } else {
        throw new Error(`toContain requires array or string target`);
      }
    },
    toBeGreaterThan(num) {
      if (actual <= num) {
        throw new Error(`Expected ${actual} > ${num}`);
      }
    },
    toBeGreaterThanOrEqual(num) {
      if (actual < num) {
        throw new Error(`Expected ${actual} >= ${num}`);
      }
    },
    toBeLessThan(num) {
      if (actual >= num) {
        throw new Error(`Expected ${actual} < ${num}`);
      }
    },
    toBeLessThanOrEqual(num) {
      if (actual > num) {
        throw new Error(`Expected ${actual} <= ${num}`);
      }
    },
    toHaveLength(len) {
      if (!actual || actual.length !== len) {
        throw new Error(`Expected length ${len} but got ${actual ? actual.length : "undefined"}`);
      }
    },
    toThrow(expectedErrorSubstring) {
      if (typeof actual !== "function") {
        throw new Error(`toThrow target must be a function`);
      }
      let threw = false;
      let error = null;
      try {
        actual();
      } catch (e) {
        threw = true;
        error = e;
      }
      if (!threw) {
        throw new Error(`Expected function to throw but it executed successfully`);
      }
      if (expectedErrorSubstring && !String(error.message || error).includes(expectedErrorSubstring)) {
        throw new Error(`Expected error message to contain "${expectedErrorSubstring}" but got "${error.message}"`);
      }
    },
  };
};
