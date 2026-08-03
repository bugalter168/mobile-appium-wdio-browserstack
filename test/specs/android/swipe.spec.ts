import { expect } from '@wdio/globals'

import SwipePage, { CAROUSEL_CARDS } from '../../screens/android/swipe.page'

/* No faker here, deliberately: the carousel's contents are fixed application content,
   so randomising which card to expect would test the app against a guess. */
describe('Swipe — horizontal carousel', () => {
  beforeEach(async () => {
    await SwipePage.open()
  })

  it('brings the next card into view after a horizontal swipe', async () => {
    await expect(SwipePage.cardWithTitle(CAROUSEL_CARDS.fullyOpenSource)).toBeDisplayed()

    await SwipePage.swipeCarouselForwards()

    await expect(SwipePage.cardWithTitle(CAROUSEL_CARDS.greatCommunity)).toBeDisplayed()
  })
})
