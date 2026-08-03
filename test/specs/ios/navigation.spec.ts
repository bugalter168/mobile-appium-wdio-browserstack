import { expect } from '@wdio/globals'

import UiElementsPage from '../../screens/ios/ui-elements.page'
import TextPage from '../../screens/ios/text.page'

describe('Navigation — UI Elements to Text and back', () => {
  beforeEach(async () => {
    await UiElementsPage.waitUntilShown()
  })

  it('returns to the UI Elements list after backing out of the Text screen', async () => {
    await UiElementsPage.openTextScreen()

    await expect(TextPage.input).toBeDisplayed()

    await TextPage.goBack()

    await expect(UiElementsPage.textButton).toBeDisplayed()
  })
})
