import CheckstyleChecker from '../src/checkstyle-checker'

test('no input file', async () => {
  process.env['GITHUB_WORKSPACE'] = "/__w/tsubakuro"
  process.env['INPUT_SPOTBUGS_INPUT'] = "__tests__/dummy_not_exist/main.xml";

  const checker:CheckstyleChecker = new CheckstyleChecker()
  const doIf = await checker.doIf()

  expect(doIf).toBe(false)
})

test('no warning file', async () => {
  process.env['GITHUB_WORKSPACE'] = "/__w/tsubakuro"
  process.env['INPUT_CHECKSTYLE_INPUT'] = "__tests__/checkstyle_0warning/connectivity/build/reports/checkstyle/main.xml";

  const checker:CheckstyleChecker = new CheckstyleChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(0)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('three warnings', async () => {
  process.env['GITHUB_WORKSPACE'] = "/__w/tsubakuro"
  process.env['INPUT_CHECKSTYLE_INPUT'] = "__tests__/checkstyle_3warnings/connectivity/build/reports/checkstyle/main.xml";

  const checker:CheckstyleChecker = new CheckstyleChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(3)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('many warnings', async () => {
  process.env['GITHUB_WORKSPACE'] = "/__w/tsubakuro"
  process.env['INPUT_CHECKSTYLE_INPUT'] = "__tests__/checkstyle_many_warnings/**/build/reports/checkstyle/main.xml";

  const checker:CheckstyleChecker = new CheckstyleChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(13)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})
