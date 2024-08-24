class ExitError extends Error {}
class ExitCancelledError extends ExitError {
  constructor(message: string) {
    super(message);
    this.name = 'ExitCancelled';
  }
}

class ExitFailedError extends ExitError {
  constructor(message: string, err?: Error) {
    err
      ? super(
          [
            message,
            err
              .toString()
              .trim()
              .split('\n')
              .map((line) => `> ${line}`)
              .join('\n'),
          ].join('\n'),
        )
      : super(message);
    this.name = 'ExitFailed';
  }
}

class KilledError extends ExitError {
  constructor() {
    super(`User killed process early`);
    this.name = 'Killed';
  }
}

export { ExitError, ExitFailedError, ExitCancelledError, KilledError };
