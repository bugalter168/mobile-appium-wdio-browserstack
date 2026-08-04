import type { ChainablePromiseElement } from "webdriverio";

import IosBasePage from "./ios-base.page";

class TextPage extends IosBasePage {
  public get input(): ChainablePromiseElement {
    return $("~Text Input");
  }

  public get output(): ChainablePromiseElement {
    return $("~Text Output");
  }

  public async waitUntilShown(): Promise<void> {
    await this.waitUntilDisplayed(this.input, "the Text Input field");
  }

  public async enterText(text: string): Promise<void> {
    await this.tap(this.input, "the Text Input field");
    /* The trailing newline commits the field and dismisses the keyboard in one step.
       XCUITest has no reliable equivalent of Android's hideKeyboard, so the keyboard
       would otherwise stay up and cover the output label. */
    await this.input.addValue(`${text}\n`);
  }

  public async goBack(): Promise<void> {
    await this.goBackTo("UI Elements");
  }
}

export default new TextPage();
