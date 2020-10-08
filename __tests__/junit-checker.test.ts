import JUnitChecker from '../src/junit-checker'

test('no input file', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_JUNIT_INPUT'] = "__tests__/dummy_not_exist/TEST-*.xml";

  const checker:JUnitChecker = new JUnitChecker()
  const doIf = await checker.doIf()

  expect(doIf).toBe(false)
})

test('no warning file', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_JUNIT_INPUT'] = "__tests__/junit_0warning/TEST-*.xml";
  process.env['INPUT_JUNIT_TEST_SRC_DIR'] = "ParallelRunner/src/test/java";

  const checker:JUnitChecker = new JUnitChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(0)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('one warning', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_JUNIT_INPUT'] = "__tests__/junit_1warning/TEST-*.xml";
  process.env['INPUT_JUNIT_TEST_SRC_DIR'] = "ParallelRunner/src/test/java";

  const checker:JUnitChecker = new JUnitChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(1)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('three warnings', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_JUNIT_INPUT'] = "__tests__/junit_3warnings/TEST-*.xml";
  process.env['INPUT_JUNIT_TEST_SRC_DIR'] = "ParallelRunner/src/test/java";

  const checker:JUnitChecker = new JUnitChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(3)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})
