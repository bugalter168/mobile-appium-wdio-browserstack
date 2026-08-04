import { expect } from "@wdio/globals";

import FormsPage, {
  DROPDOWN_OPTIONS,
  SWITCH_LABELS,
} from "../../screens/android/forms.page";
import { generateInputText } from "../../data/generate";

describe("Forms", () => {
  beforeEach(async () => {
    await FormsPage.open();
  });

  it("reflects typed text back into the result label", async () => {
    const typedText = generateInputText();

    await FormsPage.enterText(typedText);

    await expect(FormsPage.enteredTextResult).toHaveText(typedText);
  });

  it("updates the switch label when the switch is toggled", async () => {
    await expect(FormsPage.switchLabel).toHaveText(SWITCH_LABELS.whenOff);

    await FormsPage.toggleSwitch();

    await expect(FormsPage.switchLabel).toHaveText(SWITCH_LABELS.whenOn);
  });

  it("shows the picked option as the dropdown value", async () => {
    await FormsPage.selectDropdownOption(DROPDOWN_OPTIONS.appium);

    await expect(FormsPage.selectedDropdownValue).toHaveText(
      DROPDOWN_OPTIONS.appium,
    );
  });
});
