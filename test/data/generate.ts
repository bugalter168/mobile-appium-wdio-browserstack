import { faker } from '@faker-js/faker'

import { MIN_PASSWORD_LENGTH } from '../screens/android/login.page'

const INPUT_TEXT_LENGTH: number = 12

export interface Credentials {
  email: string
  password: string
}

/* Lowercased because iOS text fields autocapitalise, which would break a round-trip
   assertion on a value the test never changed. */
export function generateEmail(): string {
  return faker.internet.email({ allowSpecialCharacters: false }).toLowerCase()
}

export function generateCredentials(): Credentials {
  return {
    email: generateEmail(),
    password: faker.internet.password({ length: MIN_PASSWORD_LENGTH + 4 }),
  }
}

export function generateInvalidEmail(): string {
  return faker.internet.username()
}

export function generateInputText(): string {
  return faker.string.alphanumeric({ length: INPUT_TEXT_LENGTH })
}
