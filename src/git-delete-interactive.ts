#!/usr/bin/env node

import { promisify } from 'util';
import prompts, { PromptObject } from 'prompts';
import { logInfo } from './utils/logging';
import { KilledError } from './utils/errors';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = promisify(require('child_process').exec);

export default async function gitDeleteInteractive(options?: Array<string>) {
  const { stdout: startingBranches } = await getBranches(options);
  let choices = await createChoices(startingBranches);
  while (choices.length) {
    const { stdout: nextBranches } = await getBranches(options);
    choices = await createChoices(nextBranches);
    const { branches } = await prompts({
      choices,
      message: 'Deleting branches',
      name: 'branches',
      onState({ value }) {
        const selectionSet = new Set(
          value
            .filter(
              ({ selected, disabled }: { disabled: boolean; selected: boolean | undefined }) =>
                selected && !disabled,
            )
            .map(({ value: selectedValue }: { value: string }) => selectedValue),
        );
        this.hint = choices
          .map((c: { hint: string; value: string }) => {
            if (selectionSet.has(c.value)) {
              selectionSet.delete(c.value);
              return c.hint;
            }
            return undefined;
          })
          .filter(Boolean);
      },
      type: 'multiselect',
      warn: 'current branch',
    } as PromptObject);

    await deleteBranches(branches);
  }
}

async function getBranches(options?: Array<string>) {
  return await exec(('git branch -v --sort=-committerdate ' + options?.join(' ')).trim());
}

async function createChoices(branches: any) {
  return branches
    .split(/\n/)
    .filter((branch: string) => !!branch.trim())
    .filter((branch: { match: (arg0: RegExp) => [string, string, string] }) => {
      const [, , value] = branch.match(/([* ]) +([^ ]+) +(.+)/);
      return value !== 'remotes/origin/HEAD';
    })
    .map((branch: { match: (arg0: RegExp) => [string, string, string, string] }) => {
      const [, flag, value, hint] = branch.match(/([* ]) +([^ ]+) +(.+)/);
      return {
        disabled: flag === '*',
        hint: `${value} -> ${hint}`,
        remote: value.includes('remotes/origin'),
        value,
      };
    });
}

async function deleteBranches(branches: Array<{ name: string; remote: boolean }>) {
  for (const branch of branches) {
    if (!branch) {
      return;
    }
    const response = await prompts(
      {
        choices: [
          {
            title: 'Yes',
            value: true,
          },
          {
            title: 'No',
            value: false,
          },
        ],
        message: `Delete ${branch}?`,
        name: 'value',
        type: 'select',
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      },
    );

    if (response.value) {
      if (branch.remote) {
        const { stdout, stderr } = await exec(`git push origin --delete ${branch}`);
        process.stdout.write(stdout);
        process.stderr.write(stderr);
      } else {
        const { stdout, stderr } = await exec(`git branch -D ${branch}`);
        process.stdout.write(stdout);
        process.stderr.write(stderr);
      }
      logInfo(`Branch ${branch} deleted.`);
    } else {
      logInfo(`Aborted.`);
    }
  }
}
