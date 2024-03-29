import CTestChecker from '../src/ctest-checker'

test('no input file', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_CTEST_INPUT'] = "__tests__/dummy_not_exist/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()

  expect(doIf).toBe(false)
})

test('no warning file', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_CTEST_INPUT'] = "__tests__/ctest_0warning/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
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
  process.env['INPUT_CTEST_INPUT'] = "__tests__/ctest_1warning/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(1)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('two warnings', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_CTEST_INPUT'] = "__tests__/ctest_2warnings/*gtest_result.xml";


  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(2)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('three warnings', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_CTEST_INPUT'] = "__tests__/ctest_3warnings/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(3)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('no suite in suites', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_CTEST_INPUT'] = "__tests__/ctest_nosuite_in_suites/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(0)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('multi folder', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_CTEST_INPUT'] = "__tests__/ctest_4warnings/build*/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(4)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('invalid_sourcepath', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_CTEST_INPUT'] = "__tests__/ctest_invalid_sourcepath/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(2)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('multiple_testsuite', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_CTEST_INPUT'] = "__tests__/ctest_multiple_testsuite/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(0)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('multiple_failure', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_CTEST_INPUT'] = "__tests__/ctest_multiple_failure/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(2)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})