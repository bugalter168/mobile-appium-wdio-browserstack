import path from 'node:path'
import { deepmerge } from 'deepmerge-ts'

import { allureResultsDir, rootDir, sharedConfig } from './wdio.shared.conf'
import { writeAllureEnvironment } from './allure-environment'

const appPath: string = path.resolve(
  rootDir,
  process.env.ANDROID_APP_PATH ?? 'apps/android.wdio.native.app.apk',
)

export const config: WebdriverIO.Config = deepmerge(sharedConfig, {
  specs: ['../test/specs/android/**/*.spec.ts'],

  hostname: '127.0.0.1',
  port: 4723,
  path: '/',

  services: [
    [
      'appium',
      {
        args: { address: '127.0.0.1', port: 4723 },
        logPath: path.join(rootDir, 'logs'),
      },
    ],
  ],

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android Emulator',

      'appium:avd': process.env.ANDROID_AVD_NAME ?? 'Pixel_7_API_34',
      'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION ?? '14',

      'appium:app': appPath,
      'appium:appWaitActivity': '*',
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 240,

      'appium:avdLaunchTimeout': 300_000,
      'appium:uiautomator2ServerInstallTimeout': 120_000,
    },
  ],

  async before(): Promise<void> {
    await writeAllureEnvironment(allureResultsDir, {
      target: 'Local Android emulator (Appium)',
      app: path.basename(appPath),
    })
  },
} satisfies Partial<WebdriverIO.Config>)
