#!/usr/bin/env node

import help from './help';
import { logInfo } from './utils/logging';
import gitDeleteInteractive from './git-delete-interactive';

const opts = process.argv.slice(2);

// Prints help message
if (opts.indexOf('-h') > -1) {
  logInfo(help);

} else {

  // Starts interactive branch listing and listen for feedback
  gitDeleteInteractive(opts);

  // Exits program execution on ESC keypress
  process.stdin.on('keypress', function (ch, key) {
    if (key && (key.name === 'escape' || key.name === 'q')) {
      process.exit();
    }
  });
}
