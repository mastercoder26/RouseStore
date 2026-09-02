#!/usr/bin/env node

import { runner } from "./harness/test-framework.mjs";

// Import all test suites
import "./e2e/tier1-reviews.test.mjs";
import "./e2e/tier1-reviews-ui.test.mjs";
import "./e2e/tier1-reviews-components.test.mjs";
import "./e2e/tier1-complaints.test.mjs";
import "./e2e/tier1-feedback-drawer.test.mjs";
import "./e2e/tier1-admin.test.mjs";
import "./e2e/tier1-motion-a11y.test.mjs";
import "./e2e/tier1-storage-repositories.test.mjs";
import "./e2e/tier2-boundary-corner.test.mjs";
import "./e2e/tier3-cross-feature.test.mjs";
import "./e2e/tier4-user-journeys.test.mjs";
import "./e2e/tier5-storage-stress.test.mjs";
import "./e2e/tier2-challenger2-rating-state.test.mjs";

// Parse CLI options
const args = process.argv.slice(2);
const options = {};

for (const arg of args) {
  if (arg.startsWith("--tier=")) {
    options.tier = arg.split("=")[1];
  } else if (arg.startsWith("--match=")) {
    options.match = arg.split("=")[1];
  } else if (arg === "--help" || arg === "-h") {
    console.log(`
Raider Station E2E Test Suite Runner

Usage:
  node tests/run-e2e-tests.mjs [options]

Options:
  --tier=<1|2|3|4>    Run only tests matching the specified tier
  --match=<string>    Run tests whose description matches string
  --help, -h          Show this help message
`);
    process.exit(0);
  }
}

async function main() {
  try {
    const summary = await runner.run(options);
    if (summary.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Fatal error running test suite:", err);
    process.exit(1);
  }
}

main();
