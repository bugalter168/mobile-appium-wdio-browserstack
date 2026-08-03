import { expect } from '@wdio/globals'

import FormsPage, {
  DROPDOWN_OPTIONS,
  SWITCH_LABELS,
} from '../../screens/android/forms.page'
import { generateInputText } from '../../data/generate'

describe('Forms — text input, switch and dropdown', () => {
  beforeEach(async () => {
    await FormsPage.open()
  })

  it('reflects typed text, a toggled switch and a picked dropdown option', async () => {
    const typedText = generateInputText()

    await FormsPage.enterText(typedText)
    await expect(FormsPage.enteredTextResult).toHaveText(typedText)

    await expect(FormsPage.switchLabel).toHaveText(SWITCH_LABELS.whenOff)
    await FormsPage.toggleSwitch()
    await expect(FormsPage.switchLabel).toHaveText(SWITCH_LABELS.whenOn)

    await FormsPage.selectDropdownOption(DROPDOWN_OPTIONS.appium)
    await expect(FormsPage.selectedDropdownValue).toHaveText(DROPDOWN_OPTIONS.appium)
  })
})
