import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { addAttachment } from '@wdio/allure-reporter'

export const rootDir: string = fileURLToPath(new URL('..', import.meta.url))

export const allureResultsDir: string = path.join(rootDir, 'allure-results')

const envFile = path.join(rootDir, '.env')
if (existsSync(envFile)) {
  process.loadEnvFile(envFile)
}

/*
 * `satisfies` rather than a type annotation, and this is load-bearing: annotating with
 * the full config type makes deepmerge-ts recurse through every hook signature and
 * capability union downstream, which overflows tsc's instantiation depth (TS2589).
 */
export const sharedConfig = {
  runner: 'local',

  maxInstances: 1,

  logLevel: 'info',
  bail: 0,
  baseUrl: '',

  waitforTimeout: 20_000,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 3,

  /* Deliberately zero. A retried mobile test hides a real race condition; we would
     rather see it fail and fix the wait than paper over it. */
  specFileRetries: 0,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120_000,
  },

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: allureResultsDir,

        /*
         * Off, and measured rather than assumed. Left on, the reporter turns every
         * WebDriver command into a step — and waitForDisplayed polls, so a single 15s
         * wait that times out emits ~150 identical `findElement` steps with a
         * request/response attachment apiece. One failing test produced 313 files and
         * pushed the failure screenshot to the bottom of a 155-step list.
         */
        disableWebdriverStepsReporting: true,

        /* Without this the reporter would also auto-attach the takeScreenshot result
           below, and every failed case would carry two identical images. */
        disableWebdriverScreenshotsReporting: true,
      },
    ],
  ],

  async afterTest(_test, _context, result): Promise<void> {
    if (result.passed) {
      return
    }

    /* A test can fail *because* the session died, and takeScreenshot then throws.
       Letting that escape would replace the real failure with a hook error. */
    try {
      if (!browser?.sessionId) {
        return
      }

      const screenshot = await browser.takeScreenshot()
      await addAttachment('Screenshot on failure', Buffer.from(screenshot, 'base64'), 'image/png')
    } catch (error) {
      console.warn(
        `[allure] Could not attach a failure screenshot (the session is probably gone): ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  },

  tsConfigPath: path.join(rootDir, 'tsconfig.json'),
} satisfies Omit<WebdriverIO.Config, 'capabilities'>
