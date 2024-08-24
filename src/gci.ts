#!/usr/bin/env node

import help from './help';
import { logInfo } from './utils/logging';
import gitCheckoutInteractive from './git-checkout-interactive';

const opts = process.argv.slice(2);

if (opts.indexOf('-h') > -1) {
  logInfo(help); // Prints help message
} else {
  // Starts interactive branch listing and listen for feedback
  gitCheckoutInteractive(opts);

  // Exits program execution on ESC keypress
  process.stdin.on('keypress', function (_, key) {
    if (key && (key.name === 'escape' || key.name === 'q')) {
      process.exit();
    }
  });
}
