import { promisify } from 'util';
import prompts, { PromptObject } from 'prompts';
import { logInfo } from './utils/logging';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = promisify(require('child_process').exec);

export default async function gitCheckoutInteractive(options?: Array<string>) {
  const { stdout: branches } = await exec(
    ('git branch -v --sort=-committerdate ' + options?.join(' ')).trim(),
  );

  const choices = branches
    .split(/\n/)
    .filter((branch: string) => !!branch.trim())
    .filter((branch: { match: (arg0: RegExp) => [any, any, any] }) => {
      const [, , value] = branch.match(/([* ]) +([^ ]+) +(.+)/);
      return value !== 'remotes/origin/HEAD';
    })
    .map((branch: { match: (arg0: RegExp) => [any, any, any, any] }) => {
      const [, flag, value, hint] = branch.match(/([* ]) +([^ ]+) +(.+)/);
      return {
        disabled: flag === '*',
        hint,
        remote: !!value.includes('remotes/origin'),
        value,
      };
    });

  const { branch } = await prompts({
    choices,
    hint: choices[0].hint,
    message: 'Switch branch',
    name: 'branch',
    onState({ value }) {
      this.hint = choices.find((c: { value: any }) => c.value === value).hint;
    },
    type: 'select',
    warn: 'current branch',
  } as PromptObject);

  await checkout(branch);
}

async function checkout(branch: { remote: any }) {
  if (!branch) return;
  logInfo(`Deleting ${[]} branch ${branch}...`);
  const { stdout, stderr } = await exec(`git checkout ${branch}`);
  process.stdout.write(stdout);
  process.stderr.write(stderr);
  return;
}
