import SpotBugsChecker from '../src/spotbugs-checker'

test('no input file', async () => {
  process.env['GITHUB_WORKSPACE'] = "/__w/tsubakuro"
  process.env['INPUT_SPOTBUGS_INPUT'] = "__tests__/dummy_not_exist/spotbugs.xml";

  const checker:SpotBugsChecker = new SpotBugsChecker()
  const doIf = await checker.doIf()

  expect(doIf).toBe(false)
})

test('no warning file', async () => {
  process.env['GITHUB_WORKSPACE'] = "/__w/tsubakuro"
  process.env['INPUT_SPOTBUGS_INPUT'] = "__tests__/spotbugs_0warning/**/spotbugs.xml";

  const checker:SpotBugsChecker = new SpotBugsChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(0)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})

test('four warnings', async () => {
  process.env['GITHUB_WORKSPACE'] = "/__w/tsubakuro"
  process.env['INPUT_SPOTBUGS_INPUT'] = "__tests__/spotbugs_4warnings/**/spotbugs.xml";

  const checker:SpotBugsChecker = new SpotBugsChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(4)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})
