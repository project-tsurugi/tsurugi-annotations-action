import ClangTidyChecker from '../src/clang-tidy-checker'

test('no input file', async () => {
  process.env['GITHUB_WORKSPACE'] = "./";
  process.env['INPUT_CLANG-TIDY-INPUT'] = "__tests__/dummy_not_exist";

  const checker:ClangTidyChecker = new ClangTidyChecker()
  const doIf = await checker.doIf()

  expect(doIf).toBe(false)
})

test('no warning file', async () => {
  process.env['GITHUB_WORKSPACE'] = "./";
  process.env['INPUT_CLANG-TIDY-INPUT'] = "__tests__/clang-tidy-0warning.log.txt";

  const checker:ClangTidyChecker = new ClangTidyChecker()
  const doIf = await checker.doIf()
  const annotations = checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(0)
})

test('one warning', async () => {
  process.env['GITHUB_WORKSPACE'] = "./";
  process.env['INPUT_CLANG-TIDY-INPUT'] = "__tests__/clang-tidy-1warning.log.txt";

  const checker:ClangTidyChecker = new ClangTidyChecker()
  const doIf = await checker.doIf()
  const annotations = checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(1)
})

test('two warnings', async () => {
  process.env['GITHUB_WORKSPACE'] = "./";
  process.env['INPUT_CLANG-TIDY-INPUT'] = "__tests__/clang-tidy-2warnings.log.txt";

  const checker:ClangTidyChecker = new ClangTidyChecker()
  const doIf = await checker.doIf()
  const annotations = checker.parse()

  expect(doIf).toBe(true)
  expect(annotations.length).toBe(2)
})
