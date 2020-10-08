import DoxygenChecker from '../src/doxygen-checker'

test('no input file', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_DOXYGEN_INPUT'] = "__tests__/dummy_not_exist";

  const checker:DoxygenChecker = new DoxygenChecker()
  const doIf = await checker.doIf()

  expect(doIf).toBe(false)
})

test('no warning file', async () => {
  process.env['GITHUB_WORKSPACE'] = process.cwd();
  process.env['INPUT_DOXYGEN_INPUT'] = "__tests__/doxygen-0warning.log.txt";

  const checker:DoxygenChecker = new DoxygenChecker()
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
  process.env['INPUT_DOXYGEN_INPUT'] = "__tests__/doxygen-1warning.log.txt";

  const checker:DoxygenChecker = new DoxygenChecker()
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
  process.env['INPUT_DOXYGEN_INPUT'] = "__tests__/doxygen-2warnings.log.txt";

  const checker:DoxygenChecker = new DoxygenChecker()
  const doIf = await checker.doIf()
  const annotations = await checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(2)

  console.log(annotations);
  console.log(checker.result);
  console.log(checker.summary);
})
