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

/* `??` is not enough for anything that can arrive from CI. An unset GitHub secret or
   variable interpolates to an empty string, not to undefined, so `?? fallback` would
   hand BrowserStack a blank device name instead of the default. */
function optional(name: string, fallback: string): string {
  const value = process.env[name]
  return value === undefined || value === '' ? fallback : value
}

const appId: string = required('BROWSERSTACK_IOS_APP_ID')

/*
 * BROWSERSTACK_APP_ID is the BrowserStack SDK's own "app for this run" variable, and it
 * outranks the `app` service option below. Leaving the Android id sitting in it is what
 * made the first iOS run start an Android build on an iPhone: the SDK log shows the
 * config arriving with "app":"BStackSampleApp" and then "Using app: WdioDemoApp".
 * Overwriting it keeps the two in agreement whichever one wins.
 */
process.env.BROWSERSTACK_APP_ID = appId

/* Device names are also iOS-specific, so they do not collide with the Android pair. */
const device: string = optional('BROWSERSTACK_IOS_DEVICE', 'iPhone 14')
const osVersion: string = optional('BROWSERSTACK_IOS_OS_VERSION', '18')

export const config: WebdriverIO.Config = deepmerge(sharedConfig, {
  specs: ['../test/specs/ios/**/*.spec.ts'],

  user: required('BROWSERSTACK_USERNAME'),
  key: required('BROWSERSTACK_ACCESS_KEY'),

  hostname: 'hub.browserstack.com',

  /* `app` only — see the same block in wdio.android.bstack.conf.ts for why anything
     else passed here can reach BrowserStack as a capability and be rejected. */
  services: [
    [
      'browserstack',
      {
        app: appId,
      },
    ],
  ],

  capabilities: [
    {
      platformName: 'ios',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': device,
      'appium:platformVersion': osVersion,

      'bstack:options': {
        projectName: 'WDIO Mobile Automation',
        buildName: optional('BROWSERSTACK_IOS_BUILD_NAME', 'iOS — BStackSampleApp'),
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
