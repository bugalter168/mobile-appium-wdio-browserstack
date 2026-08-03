import type { ChainablePromiseElement } from 'webdriverio'

export const DEFAULT_TIMEOUT: number = 15_000

const SWIPE_DURATION: number = 750

const SWIPE_EDGE_INSET: number = 0.1

export default abstract class BasePage {
  protected async waitUntilDisplayed(
    element: ChainablePromiseElement,
    description: string,
    timeout: number = DEFAULT_TIMEOUT,
  ): Promise<void> {
    await element.waitForDisplayed({
      timeout,
      timeoutMsg: `Expected ${description} to be displayed within ${timeout}ms, but it never appeared.`,
    })
  }

  protected async tap(element: ChainablePromiseElement, description: string): Promise<void> {
    await this.waitUntilDisplayed(element, description)
    await element.waitForEnabled({
      timeout: DEFAULT_TIMEOUT,
      timeoutMsg: `Expected ${description} to become enabled within ${DEFAULT_TIMEOUT}ms, but it stayed disabled.`,
    })
    await element.click()
  }

  protected async setValue(
    element: ChainablePromiseElement,
    value: string,
    description: string,
  ): Promise<void> {
    await this.waitUntilDisplayed(element, description)
    await element.setValue(value)
  }

  protected async hideKeyboardIfShown(): Promise<void> {
    if (!(await driver.isKeyboardShown())) {
      return
    }

    await driver.hideKeyboard()
    await driver.waitUntil(async () => !(await driver.isKeyboardShown()), {
      timeout: DEFAULT_TIMEOUT,
      timeoutMsg: `Soft keyboard was still shown ${DEFAULT_TIMEOUT}ms after requesting it be hidden.`,
    })
  }

  protected async swipeLeftOn(
    element: ChainablePromiseElement,
    description: string,
  ): Promise<void> {
    await this.waitUntilDisplayed(element, description)

    const { x, y } = await element.getLocation()
    const { width, height } = await element.getSize()

    const centreY = Math.round(y + height / 2)
    const startX = Math.round(x + width * (1 - SWIPE_EDGE_INSET))
    const endX = Math.round(x + width * SWIPE_EDGE_INSET)

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: centreY },
          { type: 'pointerDown', button: 0 },
          /* NOT a violation of this project's no-hard-sleep rule, which targets
             driver.pause() — a blind sleep that masks a race condition. This is a step
             inside a W3C Actions sequence, and it describes the gesture itself: without
             a hold between pointerDown and pointerMove, Android frequently registers the
             sequence as a tap, or as a fling that overshoots past the intended card. */
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: SWIPE_DURATION, x: endX, y: centreY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])

    /* No releaseActions() here. BrowserStack's hub does not route DELETE /session/:id/
       actions and answers it with "unknown command", which failed this swipe on the
       first cloud run. It is safe to drop rather than guard: the sequence above ends
       with its own pointerUp, so no input source is left depressed to release. */
  }
}
