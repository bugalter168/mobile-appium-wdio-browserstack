import { expect } from '@wdio/globals'

import UiElementsPage from '../../screens/ios/ui-elements.page'
import TextPage from '../../screens/ios/text.page'
import { generateEmail } from '../../data/generate'

describe('Text — input round trip', () => {
  beforeEach(async () => {
    await UiElementsPage.waitUntilShown()
    await UiElementsPage.openTextScreen()
    await TextPage.waitUntilShown()
  })

  it('echoes the typed text back into the output label', async () => {
    const typedText = generateEmail()

    await TextPage.enterText(typedText)

    await expect(TextPage.output).toHaveText(typedText)
  })
})
