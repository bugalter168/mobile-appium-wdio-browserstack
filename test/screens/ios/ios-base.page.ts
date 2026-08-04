import type { ChainablePromiseElement } from "webdriverio";

import BasePage from "../base.page";

/* iOS names the navigation back button after the previous screen's title, so a
   screen asks to go back by naming where it returns to. */
export default abstract class IosBasePage extends BasePage {
  protected backButton(previousScreenTitle: string): ChainablePromiseElement {
    return $(`~${previousScreenTitle}`);
  }

  protected async goBackTo(previousScreenTitle: string): Promise<void> {
    await this.tap(
      this.backButton(previousScreenTitle),
      `the back button to ${previousScreenTitle}`,
    );
  }
}
