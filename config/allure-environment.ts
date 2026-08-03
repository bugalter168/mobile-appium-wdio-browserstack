import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export interface RunEnvironment {
  target: string
  app: string
}

function text(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value
  }
  if (typeof value === 'number') {
    return String(value)
  }
  return undefined
}

/* Java .properties treats a backslash as an escape character and a newline as a record
   separator, so a raw Windows path or multi-line value would corrupt the file. */
function escapeValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/[\r\n]+/g, ' ')
}

function serialise(entries: Record<string, string | undefined>): string {
  return (
    Object.entries(entries)
      /* Empty as well as undefined: APP_VERSION is present-but-blank in .env.example,
         and writing `App.Version=` puts an empty row in the report's Environment widget. */
      .filter((entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== '')
      .map(([key, value]) => `${key}=${escapeValue(value)}`)
      .join('\n') + '\n'
  )
}

export async function writeAllureEnvironment(
  outputDir: string,
  run: RunEnvironment,
): Promise<void> {
  /* Never allowed to fail a run: on BrowserStack the minutes are metered, and losing the
     whole suite over a report annotation would be a bad trade. */
  try {
    const caps = browser.capabilities as unknown as Record<string, unknown>

    const entries: Record<string, string | undefined> = {
      'Execution.Target': run.target,
      Platform: text(caps.platformName) ?? text(caps['appium:platformName']),
      Device: text(caps.deviceModel) ?? text(caps.deviceName) ?? text(caps['appium:deviceName']),
      'OS.Version': text(caps.platformVersion) ?? text(caps['appium:platformVersion']),
      /* Android-only; absent keys are dropped by serialise(), so iOS runs simply omit it. */
      'Android.API.Level': text(caps.deviceApiLevel),
      App: run.app,
      'App.Version': process.env.APP_VERSION,
      Automation: text(caps.automationName) ?? text(caps['appium:automationName']),
    }

    mkdirSync(outputDir, { recursive: true })
    writeFileSync(path.join(outputDir, 'environment.properties'), serialise(entries), 'utf8')
  } catch (error) {
    console.warn(
      `[allure] Could not write environment.properties: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
}
