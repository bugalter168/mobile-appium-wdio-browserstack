import type { ChainablePromiseElement } from 'webdriverio'

import BasePage from '../base.page'

export const ALERTS = {
  loginSuccess: {
    title: 'Success',
    message: 'You are logged in!',
  },
  signUpSuccess: {
    title: 'Signed Up!',
    message: 'You successfully signed up!',
  },
} as const

class NativeAlertPage extends BasePage {
  /* The title is the app's own id, not the framework's android:id/alertTitle —
     message and button1 below are framework ids. */
  public get title(): ChainablePromiseElement {
    return $('android=new UiSelector().resourceId("com.wdiodemoapp:id/alert_title")')
  }

  public get message(): ChainablePromiseElement {
    return $('android=new UiSelector().resourceId("android:id/message")')
  }

  public get okButton(): ChainablePromiseElement {
    return $('android=new UiSelector().resourceId("android:id/button1")')
  }

  public async waitUntilShown(): Promise<void> {
    await this.waitUntilDisplayed(this.title, 'the native alert dialog')
  }

  public async dismiss(): Promise<void> {
    await this.tap(this.okButton, 'the alert OK button')
    await this.title.waitForDisplayed({
      reverse: true,
      timeout: 10_000,
      timeoutMsg: 'The native alert was still displayed 10000ms after tapping OK.',
    })
  }
}

export default new NativeAlertPage()
