import type { ChainablePromiseElement } from "webdriverio";

import IosBasePage from "./ios-base.page";

class UiElementsPage extends IosBasePage {
  public get textButton(): ChainablePromiseElement {
    return $("~Text Button");
  }

  public async openTextScreen(): Promise<void> {
    await this.tap(this.textButton, 'the "Text Button" list item');
  }

  public async waitUntilShown(): Promise<void> {
    await this.waitUntilDisplayed(this.textButton, "the UI Elements list");
  }
}

export default new UiElementsPage();
