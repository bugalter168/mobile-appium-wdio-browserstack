import type { ChainablePromiseElement } from 'webdriverio'

import AndroidBasePage from './android-base.page'

/** Complete set of dropdown options, mapped from src/components/FormComponents.tsx. */
export const DROPDOWN_OPTIONS = {
  webdriverIo: 'webdriver.io is awesome',
  appium: 'Appium is awesome',
  thisApp: 'This app is awesome',
} as const

/* The label names the action available, not the current state — so the "turn it ON"
   wording means the switch is currently OFF. */
export const SWITCH_LABELS = {
  whenOff: 'Click to turn the switch ON',
  whenOn: 'Click to turn the switch OFF',
} as const

class FormsPage extends AndroidBasePage {
  public get screen(): ChainablePromiseElement {
    return $('~Forms-screen')
  }

  public get textInput(): ChainablePromiseElement {
    return $('~text-input')
  }

  public get enteredTextResult(): ChainablePromiseElement {
    return $('~input-text-result')
  }

  public get switchControl(): ChainablePromiseElement {
    return $('~switch')
  }

  public get switchLabel(): ChainablePromiseElement {
    return $('~switch-text')
  }

  public get dropdown(): ChainablePromiseElement {
    return $('~Dropdown')
  }

  public dropdownOption(label: string): ChainablePromiseElement {
    return $(`android=new UiSelector().text("${label}")`)
  }

  public get selectedDropdownValue(): ChainablePromiseElement {
    return $('android=new UiSelector().resourceId("text_input")')
  }

  public async open(): Promise<void> {
    await this.openTab('Forms')
    await this.waitUntilDisplayed(this.screen, 'the Forms screen')
  }

  public async enterText(text: string): Promise<void> {
    await this.setValue(this.textInput, text, 'the Forms text input')
    await this.hideKeyboardIfShown()
  }

  public async toggleSwitch(): Promise<void> {
    await this.tap(this.switchControl, 'the switch')
  }

  public async selectDropdownOption(label: string): Promise<void> {
    await this.tap(this.dropdown, 'the dropdown')
    await this.tap(this.dropdownOption(label), `the dropdown option "${label}"`)
  }
}

export default new FormsPage()
