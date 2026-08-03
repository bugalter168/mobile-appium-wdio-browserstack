import type { ChainablePromiseElement } from 'webdriverio'

import BasePage from '../base.page'

class TextPage extends BasePage {
  public get input(): ChainablePromiseElement {
    return $('~Text Input')
  }

  public get output(): ChainablePromiseElement {
    return $('~Text Output')
  }

  /* iOS names the navigation back button after the previous screen's title, so the
     button that leaves this screen is addressed as the screen it returns to. */
  public get backButton(): ChainablePromiseElement {
    return $('~UI Elements')
  }

  public async waitUntilShown(): Promise<void> {
    await this.waitUntilDisplayed(this.input, 'the Text Input field')
  }

  public async enterText(text: string): Promise<void> {
    await this.tap(this.input, 'the Text Input field')
    /* The trailing newline commits the field and dismisses the keyboard in one step.
       XCUITest has no reliable equivalent of Android's hideKeyboard, so the keyboard
       would otherwise stay up and cover the output label. */
    await this.input.addValue(`${text}\n`)
  }

  public async goBack(): Promise<void> {
    await this.tap(this.backButton, 'the back button to UI Elements')
  }
}

export default new TextPage()
