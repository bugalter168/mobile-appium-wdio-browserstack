import { expect } from '@wdio/globals'

import LoginPage from '../../screens/android/login.page'
import { generateCredentials, generateInvalidEmail } from '../../data/generate'

describe('Login — invalid email format', () => {
  beforeEach(async () => {
    await LoginPage.openLoginForm()
  })

  it('shows an inline validation error and does not submit', async () => {
    const { password } = generateCredentials()

    await LoginPage.login(generateInvalidEmail(), password)

    await expect(LoginPage.emailValidationError).toBeDisplayed()

    await expect(LoginPage.screen).toBeDisplayed()
    await expect(LoginPage.loginButton).toBeDisplayed()
  })
})
