import { deepmerge } from "deepmerge-ts";

import { allureResultsDir, sharedConfig } from "./wdio.shared.conf";
import { writeAllureEnvironment } from "./allure-environment";

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    /* Thrown at config load, before any session opens, so a missing credential costs
       nothing. Discovering it from a BrowserStack auth failure costs a billed session. */
    throw new Error(
      `${name} is not set. Copy .env.example to .env and fill it in, or export ${name} in your shell.`,
    );
  }
  return value;
}

/* `??` is not enough for anything that can arrive from CI. An unset GitHub secret or
   variable interpolates to an empty string, not to undefined, so `?? fallback` would
   hand BrowserStack a blank device name instead of the default. */
function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value === "" ? fallback : value;
}

const appId: string = required("BROWSERSTACK_ANDROID_APP_ID");

/*
 * BROWSERSTACK_APP_ID is the BrowserStack SDK's own "app for this run" variable, and it
 * outranks the `app` service option below: with both set, the SDK logs the option's
 * value in its received config and then reports "Using app: <the env var>". That is why
 * this repo's per-platform ids are named BROWSERSTACK_ANDROID_APP_ID and
 * BROWSERSTACK_IOS_APP_ID — the reserved name is never overloaded to mean one platform.
 * Pointing it at this config's own app keeps the two in agreement whichever one wins.
 */
process.env.BROWSERSTACK_APP_ID = appId;

const device: string = optional("BROWSERSTACK_DEVICE", "Google Pixel 8");
const osVersion: string = optional("BROWSERSTACK_OS_VERSION", "14.0");

export const config: WebdriverIO.Config = deepmerge(sharedConfig, {
  specs: ["../test/specs/android/**/*.spec.ts"],

  user: required("BROWSERSTACK_USERNAME"),
  key: required("BROWSERSTACK_ACCESS_KEY"),

  hostname: "hub.browserstack.com",

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
      "browserstack",
      {
        app: appId,
      },
    ],
  ],

  /* One device. The trial is 100 minutes total and every spec file opens its own billed
     session, so a second entry here doubles the bill for the same coverage. */
  capabilities: [
    {
      platformName: "android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": device,
      "appium:platformVersion": osVersion,

      "bstack:options": {
        projectName: "WDIO Mobile Automation",
        buildName: optional(
          "BROWSERSTACK_BUILD_NAME",
          "Android — WebdriverIO Demo App",
        ),

        /* Literal placeholder parsed by BrowserStack, not a JS template string. It
           appends a run counter to buildName, which is what keeps separate runs from
           collapsing into one dashboard build. */
        buildIdentifier: "#${BUILD_NUMBER}",
      },
    },
  ],

  async before(): Promise<void> {
    await writeAllureEnvironment(allureResultsDir, {
      target: "BrowserStack App Automate",
      app: appId,
    });
  },
} satisfies Partial<WebdriverIO.Config>);
