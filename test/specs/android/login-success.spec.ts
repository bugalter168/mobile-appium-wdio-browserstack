import { expect } from '@wdio/globals'

import LoginPage from '../../screens/android/login.page'
import NativeAlertPage, { ALERTS } from '../../screens/android/native-alert.page'
import { generateCredentials } from '../../data/generate'

describe('Login — valid credentials', () => {
  beforeEach(async () => {
    await LoginPage.openLoginForm()
  })

  it('shows the success alert after submitting a valid email and password', async () => {
    const { email, password } = generateCredentials()

    await LoginPage.login(email, password)

    await NativeAlertPage.waitUntilShown()

    await expect(NativeAlertPage.title).toHaveText(ALERTS.loginSuccess.title)
    await expect(NativeAlertPage.message).toHaveText(ALERTS.loginSuccess.message)

    await NativeAlertPage.dismiss()
  })
})
