import JUnitChecker from './junit-checker'

class CTestChecker extends JUnitChecker {
  get name(): string {
    return 'CTest'
  }
  get input(): string {
    return 'ctest_input'
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async createAnnotation(testcase: any): Promise<any> {
    /* eslint-enable */
    if (testcase.failure) {
      const failureMessage: string = testcase.failure._attributes.message
      const firstLineIndex = failureMessage.indexOf('\n')
      const pathLine = failureMessage.substr(0, firstLineIndex).split(':')
      let path = pathLine[0].substring(
        `${process.env.GITHUB_WORKSPACE}`.length + 1
      )
      let start_line = pathLine[1]
      let end_line = pathLine[1]
      let message = failureMessage.substr(firstLineIndex)

      if (!path) {
        path = 'unknouwn file'
      }
      if (!start_line) {
        start_line = '1'
      }
      if (!end_line) {
        end_line = '1'
      }
      if (!message) {
        message = failureMessage
      }

      const annotation = {
        path,
        start_line,
        end_line,
        annotation_level: 'failure',
        message,
        title: `${testcase._attributes.classname}.${testcase._attributes.name}`
      }
      return annotation
    }
  }
}

export default CTestChecker
