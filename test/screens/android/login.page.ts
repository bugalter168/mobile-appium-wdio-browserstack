import type { ChainablePromiseElement } from 'webdriverio'

import AndroidBasePage from './android-base.page'

/** Complete set of inline validation messages, mapped from src/components/LoginForm.tsx. */
export const VALIDATION_MESSAGES = {
  invalidEmail: 'Please enter a valid email address',
  shortPassword: 'Please enter at least 8 characters',
  passwordMismatch: 'Please enter the same password',
} as const

export const MIN_PASSWORD_LENGTH: number = 8

class LoginPage extends AndroidBasePage {
  public get screen(): ChainablePromiseElement {
    return $('~Login-screen')
  }

  public get loginFormTab(): ChainablePromiseElement {
    return $('~button-login-container')
  }

  public get signUpFormTab(): ChainablePromiseElement {
    return $('~button-sign-up-container')
  }

  public get emailInput(): ChainablePromiseElement {
    return $('~input-email')
  }

  public get passwordInput(): ChainablePromiseElement {
    return $('~input-password')
  }

  public get repeatPasswordInput(): ChainablePromiseElement {
    return $('~input-repeat-password')
  }

  public get loginButton(): ChainablePromiseElement {
    return $('~button-LOGIN')
  }

  public get signUpButton(): ChainablePromiseElement {
    return $('~button-SIGN UP')
  }

  /* Matching on the visible string is not a shortcut: react-native-elements@3.4.3
     renders `errorMessage` into a bare <Text> with no testID and no accessibilityLabel
     (dist/input/Input.js:119), so this is the only handle the component offers. */
  public validationError(message: string): ChainablePromiseElement {
    return $(`android=new UiSelector().text("${message}")`)
  }

  public get emailValidationError(): ChainablePromiseElement {
    return this.validationError(VALIDATION_MESSAGES.invalidEmail)
  }

  public async open(): Promise<void> {
    await this.openTab('Login')
    await this.waitUntilDisplayed(this.screen, 'the Login screen')
  }

  public async openLoginForm(): Promise<void> {
    await this.open()
    await this.tap(this.loginFormTab, 'the Login form tab')
    await this.waitUntilDisplayed(this.loginButton, 'the LOGIN button')
  }

  public async openSignUpForm(): Promise<void> {
    await this.open()
    await this.tap(this.signUpFormTab, 'the Sign up form tab')
    await this.waitUntilDisplayed(this.signUpButton, 'the SIGN UP button')
  }

  public async login(email: string, password: string): Promise<void> {
    await this.setValue(this.emailInput, email, 'the email field')
    await this.setValue(this.passwordInput, password, 'the password field')
    /* The keyboard clips the submit button while it is up. */
    await this.hideKeyboardIfShown()
    await this.tap(this.loginButton, 'the LOGIN button')
  }

  public async signUp(email: string, password: string): Promise<void> {
    await this.setValue(this.emailInput, email, 'the email field')
    await this.setValue(this.passwordInput, password, 'the password field')
    await this.setValue(this.repeatPasswordInput, password, 'the confirm password field')
    /* The keyboard clips the submit button while it is up. */
    await this.hideKeyboardIfShown()
    await this.tap(this.signUpButton, 'the SIGN UP button')
  }
}

export default new LoginPage()
