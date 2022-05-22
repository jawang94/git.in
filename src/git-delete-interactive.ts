#!/usr/bin/env node

import { promisify } from 'util';
import prompts, { PromptObject } from 'prompts';
import { logInfo } from './utils/logging'
import { KilledError } from './utils/errors';

const exec = promisify(require('child_process').exec)

export default async function gitDeleteInteractive (options = []) {
  const { stdout: branches } = await exec(('git branch -v --sort=-committerdate ' + options.join(' ')).trim());

  const choices = branches
    .split(/\n/)
    .filter((branch: string) => !!branch.trim())
    .filter((branch: { match: (arg0: RegExp) => [any, any, any]; }) => {
      const [, , value, ] = branch.match(/([* ]) +([^ ]+) +(.+)/)
      return value !== "remotes/origin/HEAD";
    })
    .map((branch: { match: (arg0: RegExp) => [any, any, any, any]; }) => {
      const [, flag, value, hint] = branch.match(/([* ]) +([^ ]+) +(.+)/)
      return {
        value,
        hint: `${value} -> ${hint}`,
        disabled: flag === '*',
        remote: value.includes("remotes/origin")
      }
    })

  const { branch } = await prompts({
    type: 'select',
    name: 'branch',
    message: 'Delete branch',
    choices,
    hint: choices[0].hint,
    warn: 'current branch',
    onState ({ value }) {
      this.hint = choices.find((c: { value: any; }) => c.value === value).hint
    }
  } as PromptObject)

  await deleteBranch(branch)
}

async function deleteBranch (branch: { remote: any; name: any; }) {
  if (!branch) return
  const response = await prompts(
    {
      type: 'select',
      name: 'value',
      message: `Delete ${branch}?`,
      choices: [
        {
          title: 'Yes',
          value: true,
        },
        {
          title: 'No',
          value: false,
        }
      ],
    },
    {
      onCancel: () => {
        throw new KilledError();
      },
    }
  );

  if (response.value) {
    if (branch.remote) {
      const { stdout, stderr } = await exec(`git push origin --delete ${branch}`)
      process.stdout.write(stdout)
      process.stderr.write(stderr)
    } else {
      const { stdout, stderr } = await exec(`git branch -D ${branch}`)
      process.stdout.write(stdout)
      process.stderr.write(stderr)
    }
    logInfo(`Branch ${branch} deleted.`)
  } else {
    logInfo(`Aborted.`)
  }
}
