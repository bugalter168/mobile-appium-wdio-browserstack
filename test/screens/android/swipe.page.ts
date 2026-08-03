import type { ChainablePromiseElement } from 'webdriverio'

import AndroidBasePage from './android-base.page'

/** Complete set of carousel card titles, in render order, mapped from src/screens/Swipe.tsx. */
export const CAROUSEL_CARDS = {
  fullyOpenSource: 'Fully Open Source',
  greatCommunity: 'Great community',
  jsFoundation: 'JS.Foundation',
  supportVideos: 'Support Videos',
  extendable: 'Extendable',
  compatible: 'Compatible',
} as const

class SwipePage extends AndroidBasePage {
  public get screen(): ChainablePromiseElement {
    return $('~Swipe-screen')
  }

  /* Every carousel card carries this same accessibility id, so this gives *a* card,
     never a particular one — cardWithTitle addresses a specific card. */
  public get anyCard(): ChainablePromiseElement {
    return $('~card')
  }

  public cardWithTitle(title: string): ChainablePromiseElement {
    return $(`android=new UiSelector().text("${title.toUpperCase()}")`)
  }

  public async open(): Promise<void> {
    await this.openTab('Swipe')
    await this.waitUntilDisplayed(this.screen, 'the Swipe screen')
  }

  public async swipeCarouselForwards(): Promise<void> {
    await this.swipeLeftOn(this.anyCard, 'a carousel card')
  }
}

export default new SwipePage()
