import JUnitChecker from './junit-checker'

class CTestChecker extends JUnitChecker {
  get name(): string {
    return 'CTest'
  }
  get input(): string {
    return 'ctest-input'
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async createAnnotation(testcase: any): Promise<any> {
    /* eslint-enable */
    if (testcase.failure) {
      const message: string = testcase.failure._attributes.message
      const firstLineIndex = message.indexOf('\n')
      const pathLine = message.substr(0, firstLineIndex).split(':')
      const relativePath = pathLine[0].substring(
        `${process.env.GITHUB_WORKSPACE}`.length + 1
      )
      const messageBody = message.substr(firstLineIndex)

      const annotation = {
        path: relativePath,
        start_line: pathLine[1],
        end_line: pathLine[1],
        annotation_level: 'failure',
        message: messageBody,
        title: `${testcase._attributes.classname}.${testcase._attributes.name}`
      }
      return annotation
    }
  }
}

export default CTestChecker
