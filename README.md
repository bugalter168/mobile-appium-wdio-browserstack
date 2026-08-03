# WDIO Mobile Automation — WebdriverIO Demo App (Android)

Mobile test automation for the [WebdriverIO Demo App](https://github.com/webdriverio/native-demo-app),
built with WebdriverIO v9 + Appium (UiAutomator2) + TypeScript + Mocha. The same test
files run against a local Android emulator and against BrowserStack App Automate.

## Prerequisites

Everything below must be on the machine before `npm run test:local` will work. Appium
and the UiAutomator2 driver are **not** in this list: both are project devDependencies,
so `npm install` is enough and there is nothing to install globally.

| Requirement | Version | Why |
|---|---|---|
| Node.js | `^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0` — see `.nvmrc` (24.18.0) | Verified on Node 24.18.0 / npm 11.16.0 |
| JDK | 17 or newer (verified: Temurin 21.0.11) | Required by the Android SDK tooling |
| **JRE for Allure** | **8 or newer — see below** | Report generation only. Easy to miss |
| Android SDK platform-tools | `adb` on `PATH`, or `ANDROID_HOME` set | Device communication |
| Android SDK emulator + a system image | API 34 (Android 14) to match the default AVD | The device under test |
| An AVD | Default name `Pixel_7_API_34` | Override with `ANDROID_AVD_NAME` |
| The app under test | `apps/android.wdio.native.app.apk` (118 MB) | Not committed — see below |

Local runs need everything above. A BrowserStack run needs only Node, the JRE for
Allure, and the three `BROWSERSTACK_*` variables — no Android SDK, no emulator, and no
local `.apk` once it has been uploaded. See
[Running on BrowserStack App Automate](#running-on-browserstack-app-automate).

### Java is required by Allure, and only by Allure

**Allure needs a Java Runtime Environment, version 8 or newer, on the machine.** It is
not optional and it is not installed by `npm install`: `allure-commandline` ships the
Allure jars, and `npm run report:generate` / `npm run report:open` run them through
whatever `java` is on your `PATH` (or at `JAVA_HOME`). Without a JRE both commands fail
with `ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.`

The tests themselves do not need it — `npm run test:local` passes on a machine with no
Java at all, and only report generation breaks. That is precisely why it is called out
here rather than left to be discovered.

```bash
java -version
```

Verified against Temurin JDK 21.0.11. A JRE is sufficient for Allure; the Android SDK
wants a full JDK anyway, so one JDK 17+ install covers both.
[Adoptium Temurin](https://adoptium.net/) is a reasonable default on all three platforms.

### The .apk

The app is not committed (118 MB, and `*.apk` is git-ignored). Download
`android.wdio.native.app.apk` from the
[demo app releases](https://github.com/webdriverio/native-demo-app/releases) and place it
at `apps/android.wdio.native.app.apk`, or point `ANDROID_APP_PATH` somewhere else.

## Setup

```bash
nvm use                 # or install the Node version in .nvmrc
npm install
cp .env.example .env    # optional — every value has a working default
```

`.env` is git-ignored and only needed to override the AVD name, platform version or apk
path. See `.env.example` for the full list.

## Running the tests

```bash
npm run test:local      # the whole suite against a local emulator
npm run typecheck       # tsc --noEmit, zero errors expected
```

The config names the AVD (`appium:avd`), so Appium is *supposed* to boot the emulator
itself. Do not rely on it — it has been observed failing: with no device attached, every
spec file failed session creation while the Appium log repeated `Emulator
'Pixel_7_API_34' not running`, costing ten minutes before the run gave up. If
`adb devices` lists nothing, start the emulator yourself first and wait for it:

```bash
emulator -avd Pixel_7_API_34 &
adb wait-for-device shell 'while [ "$(getprop sys.boot_completed)" != 1 ]; do sleep 1; done'
```

A single spec file:

```bash
npx wdio run ./config/wdio.android.local.conf.ts --spec test/specs/android/swipe.spec.ts
```

## Running on BrowserStack App Automate

The same five spec files run unchanged — only the config differs. For iOS, see
[Running iOS on BrowserStack](#running-ios-on-browserstack).

### 1. Credentials

Three variables are required. Put them in `.env` (git-ignored) or export them:

| Variable | Where from |
|---|---|
| `BROWSERSTACK_USERNAME` | [Account settings](https://www.browserstack.com/accounts/profile/details) |
| `BROWSERSTACK_ACCESS_KEY` | Same page |
| `BROWSERSTACK_ANDROID_APP_ID` | The `bs://` id (or custom_id) returned by the upload below |

None of them have defaults. `config/wdio.android.bstack.conf.ts` throws at **config load
time** if any is missing, so a typo costs nothing rather than a billed session.

### 2. Uploading the app

The `.apk` must be uploaded to BrowserStack once; the upload returns an id you then put
in `BROWSERSTACK_ANDROID_APP_ID`. Run this yourself — nothing in this repo uploads on your behalf.

**Git Bash, macOS, Linux:**

```bash
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@apps/android.wdio.native.app.apk"
```

**PowerShell** — note `curl.exe`, not `curl`. In PowerShell, `curl` is an alias for
`Invoke-WebRequest`, which does not understand `-u` or `-F` and will fail confusingly:

```powershell
curl.exe -u "${env:BROWSERSTACK_USERNAME}:${env:BROWSERSTACK_ACCESS_KEY}" -X POST "https://api-cloud.browserstack.com/app-automate/upload" -F "file=@apps/android.wdio.native.app.apk"
```

The response is JSON:

```json
{"app_url":"bs://c8ddcb5f6a3e2b4d9e1a0f7c2b8d4e6a1f3c5b7d"}
```

Put that whole `bs://…` string into `BROWSERSTACK_ANDROID_APP_ID`.

Optionally add `-F "custom_id=WdioDemoApp"` to the upload. BrowserStack then accepts
`BROWSERSTACK_ANDROID_APP_ID=WdioDemoApp` and resolves it to the most recent upload under that
id, so re-uploading a new build does not mean editing `.env` again.

### 3. Run

```bash
npm run test:bstack
```

Results appear at
[App Automate dashboard](https://app-automate.browserstack.com/dashboard), grouped under
the build name, one session per spec file, each named after the test it ran. Pass/fail
status is pushed back to BrowserStack by `@wdio/browserstack-service`, so the dashboard
agrees with the console.

Both of those are service defaults rather than settings in this repo, deliberately — see
[Service options leak into capabilities](#service-options-leak-into-capabilities).

### Device selection

The config runs **one** device, defaulting to Google Pixel 8 / Android 14.0. Override
with `BROWSERSTACK_DEVICE` and `BROWSERSTACK_OS_VERSION`.

> **Check the device string against BrowserStack's live device list before your first
> run.** A device/version pair that BrowserStack does not offer fails at session
> creation, and on a metered trial that is a wasted start.

Adding a second capability entry would double the bill for the same coverage — see
[One session per spec file](#one-session-per-spec-file).

## Running iOS on BrowserStack

iOS is **cloud-only**, and that is a platform constraint rather than a choice. Driving a
real iOS device or simulator locally requires Xcode and the XCUITest runner, which exist
only on macOS — so on a Windows or Linux machine there is no local iOS path at all.
That is why this framework is Android-first: Android gives a full local
edit-run-debug loop, and iOS gets a smaller suite that runs on real devices in
BrowserStack.

### The app under test is different

iOS does **not** run the WebdriverIO Demo App. That app ships an iOS *simulator* build
only, and App Automate runs real devices, which cannot install a simulator binary. iOS
therefore targets BrowserStack's own **BStackSampleApp**.

Different app, different screens, so `test/screens/ios/` shares nothing with
`test/screens/android/` beyond `BasePage` — the platform-neutral touchscreen mechanics.
The two suites are deliberately not mirrors of each other.

What the sample app offers is a "UI Elements" list with a text screen behind it — there
is no login flow to exercise. The two specs cover what is actually there:

| Spec | What it does |
|---|---|
| `test/specs/ios/text-input.spec.ts` | Types generated text and asserts the output label echoes it |
| `test/specs/ios/navigation.spec.ts` | Opens the Text screen and backs out to the list |

### 1. Download the .ipa

From BrowserStack's sample apps:

```bash
curl -L -o apps/BStackSampleApp.ipa \
  "https://www.browserstack.com/app-automate/sample-apps/ios/BStackSampleApp.ipa"
```

It is git-ignored (`*.ipa`), like the `.apk`.

### 2. Upload it with a custom_id

**Git Bash, macOS, Linux:**

```bash
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@apps/BStackSampleApp.ipa" \
  -F "custom_id=BStackSampleApp"
```

**PowerShell** — `curl.exe`, not `curl`:

```powershell
curl.exe -u "${env:BROWSERSTACK_USERNAME}:${env:BROWSERSTACK_ACCESS_KEY}" -X POST "https://api-cloud.browserstack.com/app-automate/upload" -F "file=@apps/BStackSampleApp.ipa" -F "custom_id=BStackSampleApp"
```

The response carries both ids:

```json
{"app_url":"bs://<hash>","custom_id":"BStackSampleApp","shareable_id":"<user>/BStackSampleApp"}
```

Because of `custom_id`, set **`BROWSERSTACK_IOS_APP_ID=BStackSampleApp`** in `.env` and
leave it there — re-uploading a new build under the same `custom_id` resolves to the
latest one without editing `.env` again. The raw `bs://<hash>` works too if you prefer
pinning an exact build.

### 3. Run

```bash
npm run test:ios:bstack
```

Like `test:bstack`, this does **not** clear `allure-results/`, so an Android run and an
iOS run compose into a single report.

Device defaults to **iPhone 14 / iOS 18**, overridable with `BROWSERSTACK_IOS_DEVICE` and
`BROWSERSTACK_IOS_OS_VERSION`. These are separate variables from the Android pair so both
platforms can be configured in one `.env`.

## Continuous integration

[`.github/workflows/browserstack.yml`](.github/workflows/browserstack.yml) runs the five
specs against BrowserStack. There is **no emulator job** — GitHub's hosted runners have
no hardware acceleration, so an emulator there is slow, flaky, and pointless when the
same specs run on a real device.

### Triggering it

| Trigger | When |
|---|---|
| `workflow_dispatch` | Manually: **Actions** tab → *BrowserStack — Android* → **Run workflow** |
| `push` to `main` | Automatically, on every push to the default branch |

Deliberately **not** on pull requests and **not** on other branches. Each run is five
billed sessions against a 100-minute trial, so a chatty trigger would exhaust it in
about four runs.

Two further guards on the same budget: the job has `timeout-minutes: 30`, so a hung
session cannot bill indefinitely, and a `concurrency` group serialises runs rather than
letting two overlap — the free tier allows one parallel session, so overlapping runs
would queue against each other on BrowserStack's side anyway.

### Secrets

Three, at **Settings → Secrets and variables → Actions → Repository secrets**. The names
must match exactly:

| Secret | Value |
|---|---|
| `BROWSERSTACK_USERNAME` | From your BrowserStack account settings |
| `BROWSERSTACK_ACCESS_KEY` | Same page |
| `BROWSERSTACK_APP_ID` (secret name) → `BROWSERSTACK_ANDROID_APP_ID` (env var) | The `bs://` id or custom_id from the app upload |

A secret that is absent or misnamed does not fail the expression — it interpolates to an
empty string, and the run then fails at session creation looking like an authentication
problem. The workflow has a **Verify secrets resolved** step that checks all three are
non-empty and fails with the offending name before any session opens.

The device is **not** configured from CI. The workflow leaves `BROWSERSTACK_DEVICE` and
`BROWSERSTACK_OS_VERSION` unset, so `config/wdio.android.bstack.conf.ts` applies its
defaults — currently Google Pixel 7 / 13.0. If your local `.env` names a different
device, CI is not testing what you tested locally; change the defaults in the config so
both agree.

### Where the artifact lands

Every run uploads `allure-results/` as an artifact named **`allure-results`**, with
`if: always()` so a failed run still produces one — including the on-failure
screenshots, which are usually the reason you are looking.

Download it from the run's summary page, under **Artifacts**, then:

```bash
npm run report:clean          # clear any local results first
unzip ~/Downloads/allure-results.zip -d allure-results
npm run report:generate
npm run report:open
```

Artifacts are kept for 30 days. Note that GitHub serves them as a `.zip` regardless of
what was uploaded, so the download is `allure-results.zip` containing the directory's
contents — unzip *into* `allure-results/`, as above, not next to it.

## Reports

The suite writes [Allure](https://allurereport.org/) results on every run, in addition to
the `spec` reporter's live console output. Results are raw JSON; turning them into a
browsable report is a separate step.

```bash
npm run test:local        # runs the suite, writes allure-results/
npm run test:bstack       # same, against BrowserStack — does NOT clear allure-results/
npm run report:generate   # builds allure-report/ from allure-results/
npm run report:open       # serves allure-report/ and opens a browser
```

`report:open` starts a local web server and stays in the foreground — stop it with
`Ctrl+C` when you are done. Opening `allure-report/index.html` directly from the
filesystem does **not** work: the report fetches its data over HTTP and a `file://` page
is blocked from doing so, which shows up as an empty report rather than an error.

Neither directory is committed; both are in `.gitignore`.

### Stale results

`npm run test:local` deletes `allure-results/` before it runs (`npm run report:clean`, in
the script itself, so there is nothing to remember). Without that, Allure would fold the
previous run's files into the new report and a fully green run would still show
yesterday's failures.

**`npm run test:bstack` deliberately does not clean.** A combined report spanning
several targets depends on results accumulating, so the BrowserStack script leaves the
directory alone and the choice of when to clear it is yours:

```bash
npm run report:clean      # once, at the start
npm run test:bstack       # Android on BrowserStack
# ... later, iOS on BrowserStack ...
npm run report:generate   # one report covering both
```

The practical consequence is an ordering rule: **run `test:local` first, or not at all,
in a session where you also run `test:bstack`.** `test:local` clears the directory, so
running it second wipes the BrowserStack results you just paid for.

Running `test:bstack` twice without cleaning is safe but not free of surprise: Allure
matches the two sets of results to the same test cases and renders the earlier one as a
retry rather than as a separate case.

### Environment tracking

Each run writes `allure-results/environment.properties`, which Allure surfaces in the
report's Environment widget. It is produced by `config/allure-environment.ts`, called
from the `before` hook of whichever config is running, and it reads the **live session's**
capabilities rather than the requested ones — so it records the device you actually got.

A local run produces:

```properties
Execution.Target=Local Android emulator (Appium)
Platform=Android
Device=sdk_gphone64_x86_64
OS.Version=14
Android.API.Level=34
App=android.wdio.native.app.apk
Automation=UiAutomator2
```

The keys are platform-neutral so an iOS run reads the same way — `Platform=iOS`,
`OS.Version=18`, and no `Android.API.Level`, which is dropped when the driver does not
report it.

A BrowserStack run produces the same keys with `Execution.Target=BrowserStack App
Automate`, the allocated device, and the `bs://` app id under `App` — so the two are
distinguishable at a glance.

Two things to know about it:

- **`App.Version` is opt-in.** Neither Appium's UiAutomator2 driver nor BrowserStack
  reports the app's `versionName` in the session capabilities, and the only route to it
  is a `mobile: shell` call that BrowserStack blocks. Rather than report a value for one
  target and nothing for the other, the key is written only when you set `APP_VERSION`.
  The `App` key always identifies the build: the apk filename locally, the `bs://` id on
  BrowserStack, and that id is unique per upload.
- **Allure supports exactly one environment per report.** In a combined report the file
  is overwritten by whichever run finished last, so the widget describes that run only.
  Individual test cases are not tagged with their target. If a combined Android + iOS
  report needs per-test attribution, that is a small addition to the config hooks, not
  something the environment file can do.

Writing the file is wrapped in a `try/catch` that logs and continues. A report
annotation is never worth failing a metered run over.

### What is in the report

Each spec file is a suite, named from its `describe`, with the test named from its `it` —
so the suite list is readable without opening individual cases.

**Failed tests carry a screenshot** of the device at the moment of failure, attached by
the `afterTest` hook in `config/wdio.shared.conf.ts`. Passing tests do not: the images
are large and nobody looks at them. If the session itself died — app crash, emulator
drop — the hook logs `[allure] Could not attach a failure screenshot` and leaves the
original failure intact, rather than turning one broken test into a broken run.

WebDriver command-level step reporting is deliberately **off**. See the comment on
`disableWebdriverStepsReporting` in `config/wdio.shared.conf.ts` for the measurements
behind that.

## Known limitations

### One session per spec file

WebdriverIO starts a fresh session for every spec **file**, not every test. Five spec
files means five sessions, five app installs and five app launches. That is a deliberate
isolation choice — no test can inherit screen state from another, and the suite has no
ordering assumption anywhere — but it is not free.

Locally the cost is visible but tolerable: a full green run takes about 60 seconds wall
clock, of which roughly 36 seconds is time inside the tests. The remaining ~24 seconds is
session churn.

**On a metered BrowserStack trial this is the number to watch.** The free App Automate
trial is capped at 100 minutes total, and per-session overhead there is larger than
locally — device allocation and app installation on a remote device cost more than they
do against a warm local emulator, so the ratio above is a floor, not an estimate. Five
one-test spec files is a poor shape for a metered plan: it pays the startup cost five
times to run about half a minute of assertions.

Three ways out, in rough order of preference:

1. **Group related tests into fewer spec files.** Login-success and sign-up both drive
   the same screen through the same form component and would share a session cleanly.
   Fewer files, same coverage, same isolation between files.
2. **Upload the app once** and reference it by its `bs://` id rather than re-uploading
   per run — which is how `BROWSERSTACK_ANDROID_APP_ID` is already wired. This removes the
   upload, not the install.
3. **Raise `maxInstances`** so sessions overlap. The free tier allows exactly one
   parallel session, so this only helps on a paid plan.

Option 1 is the only one that changes the session count, and it is worth doing only once
the real per-session cost on BrowserStack has been measured rather than guessed. The
first run will show it.

### BROWSERSTACK_APP_ID is reserved by the SDK

The BrowserStack SDK treats `BROWSERSTACK_APP_ID` as "the app for this run", and it
**overrides** the `app` option the config passes to the service. The SDK's own log shows
both halves of it:

```
CLI info  Config : {... "app":"BStackSampleApp" ...}
CLI info  [appautomate:service]  Using app: WdioDemoApp
```

The first line is what `config/wdio.ios.bstack.conf.ts` asked for; the second is the
Android id that happened to be sitting in `BROWSERSTACK_APP_ID`. The result was an
Android build being started on an iPhone, rejected with `BROWSERSTACK_INVALID_APP_CAP`.

Two things follow, and both are in place:

- The per-platform ids are named `BROWSERSTACK_ANDROID_APP_ID` and
  `BROWSERSTACK_IOS_APP_ID`. The reserved name is never overloaded to mean one platform.
- Each BrowserStack config assigns `process.env.BROWSERSTACK_APP_ID` to its own app id at
  load time, so the reserved variable and the service option always agree — whichever
  one the SDK decides to honour.

The GitHub secret keeps its original name; only the environment variable the workflow
exposes to the config was renamed.

### BrowserStack's hub does not implement Release Actions

`DELETE /session/:id/actions` — the W3C Release Actions command, `driver.releaseActions()`
in WebdriverIO — is answered by BrowserStack's App Automate hub with:

```
WebDriverError: The requested resource could not be found, or a request was received
using an HTTP method that is not supported by the mapped resource
when running "actions" with method "DELETE"
```

A local Appium session supports it, so this only shows up in the cloud. `swipeLeftOn` in
`test/screens/base.page.ts` therefore does not call it. That is safe rather than a
workaround: the action sequence ends with its own `pointerUp`, so no input source is left
depressed for Release Actions to clean up.

Worth knowing generally — the hub does not implement every endpoint a local Appium server
does, and the failures surface as `unknown command` rather than as anything that names
the gap.

### Service options leak into capabilities

`@wdio/browserstack-service` (9.33.0) copies service options it does not otherwise
consume into the `bstack:options` capability, then removes only four of them by name
before the session request — `NOT_ALLOWED_KEYS_IN_CAPS` in the service bundle lists
`includeTagsInTestingScope`, `excludeTagsInTestingScope`, `testManagementOptions` and
`skipAppOverride`. Any other service option reaches BrowserStack as if it were a
capability, and the hub rejects it against its schema:

```
The property '#/alwaysMatch/bstack:options' contains additional properties
["sessionNamePrependTopLevelSuiteTitle"] outside of the schema
```

That failure happens at session creation, so it costs a start rather than minutes — but
it costs the whole run. The mitigation is to pass the service as little as possible:
`config/wdio.android.bstack.conf.ts` passes `app` and nothing else, and relies on
`setSessionName` / `setSessionStatus` defaulting to `true` internally.

The cost is `sessionNamePrependTopLevelSuiteTitle`, which would have prefixed each
session name with its suite title. Session names are now the `it` title alone, which is
descriptive enough to identify the test. Re-adding it means risking the same rejection.

### Dependency advisories

`npm audit` reports 24 advisories (23 high, 1 moderate) in the installed tree, and every
one of them arrives transitively through the WebdriverIO and Appium developer toolchain.
`npm audit --omit=dev` reports **0 vulnerabilities**, which is the number that matters
here: this project is a test harness with no runtime dependencies and ships nothing to
production, so no advisory in the tree is reachable by deployed code. `npm audit fix
--force` was not run because it resolves these by downgrading and cross-upgrading pinned
WebdriverIO and Appium packages, which rewrites the dependency tree that the suite is
verified green against, in exchange for no reduction in real exposure.

### TypeScript 5.x, not 7.x

TypeScript 7.0.2 is current, but this project pins `^5.9.3`. WebdriverIO v9's type
definitions are authored and tested against the TypeScript 5.x compiler, and the project
requires `npx tsc --noEmit` to return zero errors. Running a freshly rewritten compiler
against a large third-party type surface risks errors that cannot be fixed from within
this repository. Revisit once WebdriverIO publishes TypeScript 7 support.
