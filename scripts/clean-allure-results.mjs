/*
 * Plain Node rather than `rm -rf` in the npm script, because npm runs scripts through
 * cmd.exe on Windows, where `rm` does not exist.
 */
import { rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const resultsDir = path.join(fileURLToPath(new URL('..', import.meta.url)), 'allure-results')

rmSync(resultsDir, { recursive: true, force: true })
