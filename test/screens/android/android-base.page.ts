import type { ChainablePromiseElement } from 'webdriverio'

import BasePage from '../base.page'

export type TabName = 'Home' | 'Webview' | 'Login' | 'Forms' | 'Swipe' | 'Drag'

export default abstract class AndroidBasePage extends BasePage {
  protected tabButton(name: TabName): ChainablePromiseElement {
    return $(`~${name}`)
  }

  public async openTab(name: TabName): Promise<void> {
    /* The app sets `tabBarHideOnKeyboard: true`, so while the soft keyboard is up the
       entire tab bar is absent from the hierarchy and any tap on it finds nothing. */
    await this.hideKeyboardIfShown()
    await this.tap(this.tabButton(name), `the "${name}" tab bar button`)
  }
}
