Playwright rules

Build a suite of tests in playwright.
A minimal number of test but try to use all the features
I mention herewith:

- e2e tests in a separte folder, not spread
- use POM when possible
- use BasePage when possible
- use fixture when possible
- heve a clear picture of vitals and performance staff
- axe-core/playwright: check wcag21aa + best practice
- make a fixture to run axe if necessary
- make also test as logged user
- save auth data in file if necessary
- add a test for the form
- consider config.dev.json for test data
- consider for one test to intercept network call (mock in test or json file)
- do not run in ci for the moment but consider it will
- formal axe assertions and performance/vitals coverage

read playwright_prompt: make a multistep plan to implement a test suite. Define the steps than I will make you build them one by one. I expect to have 3-5 steps if possible, otherwise make your choice.
Tell me how many tests you estimate to build
