import type { ChainablePromiseElement } from 'webdriverio'

import BasePage from '../base.page'

class UiElementsPage extends BasePage {
  public get textButton(): ChainablePromiseElement {
    return $('~Text Button')
  }

  public async openTextScreen(): Promise<void> {
    await this.tap(this.textButton, 'the "Text Button" list item')
  }

  public async waitUntilShown(): Promise<void> {
    await this.waitUntilDisplayed(this.textButton, 'the UI Elements list')
  }
}

export default new UiElementsPage()
