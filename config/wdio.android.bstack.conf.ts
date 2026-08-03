import { deepmerge } from 'deepmerge-ts'

import { allureResultsDir, sharedConfig } from './wdio.shared.conf'
import { writeAllureEnvironment } from './allure-environment'

function required(name: string): string {
  const value = process.env[name]
  if (value === undefined || value === '') {
    /* Thrown at config load, before any session opens, so a missing credential costs
       nothing. Discovering it from a BrowserStack auth failure costs a billed session. */
    throw new Error(
      `${name} is not set. Copy .env.example to .env and fill it in, or export ${name} in your shell.`,
    )
  }
  return value
}

const appId: string = required('BROWSERSTACK_APP_ID')

const device: string = process.env.BROWSERSTACK_DEVICE ?? 'Google Pixel 7'
const osVersion: string = process.env.BROWSERSTACK_OS_VERSION ?? '13.0'

export const config: WebdriverIO.Config = deepmerge(sharedConfig, {
  specs: ['../test/specs/android/**/*.spec.ts'],

  user: required('BROWSERSTACK_USERNAME'),
  key: required('BROWSERSTACK_ACCESS_KEY'),

  hostname: 'hub.browserstack.com',

  /*
   * `app` only, and that restraint is load-bearing. @wdio/browserstack-service copies
   * service options it does not otherwise consume into `bstack:options`, then strips
   * just four of them by name before the session request (NOT_ALLOWED_KEYS_IN_CAPS in
   * the service bundle). Anything outside that hardcoded list reaches BrowserStack as a
   * capability and is rejected by its schema — which is what killed the first run here,
   * with `sessionNamePrependTopLevelSuiteTitle` set in this very object.
   *
   * Session naming and pass/fail status marking still happen: setSessionName and
   * setSessionStatus both default to true inside the service, so passing them buys
   * nothing and only adds another key that could leak.
   */
  services: [
    [
      'browserstack',
      {
        app: appId,
      },
    ],
  ],

  /* One device. The trial is 100 minutes total and every spec file opens its own billed
     session, so a second entry here doubles the bill for the same coverage. */
  capabilities: [
    {
      platformName: 'android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': device,
      'appium:platformVersion': osVersion,

      'bstack:options': {
        projectName: 'WDIO Mobile Automation',
        buildName: process.env.BROWSERSTACK_BUILD_NAME ?? 'Android — WebdriverIO Demo App',

        /* Literal placeholder parsed by BrowserStack, not a JS template string. It
           appends a run counter to buildName, which is what keeps separate runs from
           collapsing into one dashboard build. */
        buildIdentifier: '#${BUILD_NUMBER}',
      },
    },
  ],

  async before(): Promise<void> {
    await writeAllureEnvironment(allureResultsDir, {
      target: 'BrowserStack App Automate',
      app: appId,
    })
  },
} satisfies Partial<WebdriverIO.Config>)
