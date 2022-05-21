import helpMessage from '../help';
import { logInfo, logWarn, logError, logSuccess } from '../utils/logging';

const opts = process.argv.slice(2);

// Prints help message
if (opts.indexOf('-h') > -1) {
  logInfo(helpMessage);

} else {

  // Starts interactive branch listing and listen for feedback
  var gci = require('../git-checkout-interactive.ts')(opts);

  gci.on('warn', logWarn);
  gci.on('error', logError);
  gci.on('success', logSuccess);

  // Exits program execution on ESC keypress
  process.stdin.on('keypress', function (ch, key) {
    if (key && (key.name === 'escape' || key.name === 'q')) {
      process.exit();
    }
  });
}
