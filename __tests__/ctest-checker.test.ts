import CTestChecker from '../src/ctest-checker'

test('no input file', async () => {
  process.env['GITHUB_WORKSPACE'] = "./";
  process.env['INPUT_CTEST-INPUT'] = "__tests__/dummy_not_exist/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()

  expect(doIf).toBe(false)
})

test('no warning file', async () => {
  process.env['GITHUB_WORKSPACE'] = "./";
  process.env['INPUT_CTEST-INPUT'] = "__tests__/ctest_0warning/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(0)
})

test('one warning', async () => {
  process.env['GITHUB_WORKSPACE'] = "./";
  process.env['INPUT_CTEST-INPUT'] = "__tests__/ctest_1warning/*gtest_result.xml";

  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(1)
})

test('two warnings', async () => {
  process.env['GITHUB_WORKSPACE'] = "./";
  process.env['INPUT_CTEST-INPUT'] = "__tests__/ctest_2warnings/*gtest_result.xml";


  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(2)
})

test('three warnings', async () => {
  process.env['GITHUB_WORKSPACE'] = "./";
  process.env['INPUT_CTEST-INPUT'] = "__tests__/ctest_3warnings/*gtest_result.xml";


  const checker:CTestChecker = new CTestChecker()
  const doIf = await checker.doIf()
  const annotations = checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(3)
})
