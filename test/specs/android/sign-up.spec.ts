import { expect } from '@wdio/globals'

import LoginPage from '../../screens/android/login.page'
import NativeAlertPage, { ALERTS } from '../../screens/android/native-alert.page'
import { generateCredentials } from '../../data/generate'

describe('Sign Up — new user', () => {
  beforeEach(async () => {
    await LoginPage.openSignUpForm()
  })

  it('shows the signed-up alert after submitting generated details', async () => {
    const { email, password } = generateCredentials()

    await LoginPage.signUp(email, password)

    await NativeAlertPage.waitUntilShown()

    await expect(NativeAlertPage.title).toHaveText(ALERTS.signUpSuccess.title)
    await expect(NativeAlertPage.message).toHaveText(ALERTS.signUpSuccess.message)

    await NativeAlertPage.dismiss()
  })
})
