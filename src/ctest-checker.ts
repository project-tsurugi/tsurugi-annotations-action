import * as fs from 'fs'
import xmljs from 'xml-js'
import Checker from './abstract-checker'

class CTestChecker extends Checker {
  private resultMessage: string = ''
  private summaryMessage: string = ''

  get name(): string {
    return 'CTest'
  }
  get input(): string {
    return 'ctest-input'
  }
  get result(): string {
    return this.resultMessage
  }
  get summary(): string {
    return this.summaryMessage
  }

  /* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any */
  parse() {
    function testFunction(testcase: any): void {
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
        annotations.push(annotation)
      }
    }

    const annotations: any[] = [] /* eslint-disable-line @typescript-eslint/no-explicit-any */
    let numTests = 0
    let numErrors = 0
    let numFailures = 0
    let numDisabled = 0
    let testTimes = 0

    for (const inputFile of this.files) {
      const xml = fs.readFileSync(inputFile, 'UTF-8')
      const xmljsOption = {compact: true, instructionHasAttributes: true}
      const json = JSON.parse(xmljs.xml2json(xml, xmljsOption))
      if (json.testsuites.testsuite) {
        const testsuite = json.testsuites.testsuite
        numTests += Number(testsuite._attributes.tests)
        numErrors += Number(testsuite._attributes.errors)
        numFailures += Number(testsuite._attributes.failures)
        numDisabled += Number(testsuite._attributes.disabled)
        testTimes += Number(testsuite._attributes.time)

        if (Array.isArray(testsuite.testcase)) {
          for (const testcase of testsuite.testcase) {
            testFunction(testcase)
          }
        } else {
          testFunction(testsuite.testcase)
        }
      }
    }
    const numFailureAndError = numFailures + numErrors
    this.resultMessage = `[${this.name}] ${numFailureAndError} test failed`
    this.summaryMessage = `Tests: ${numTests}, Failures: ${numFailures}, Errors: ${numErrors}, Disabled: ${numDisabled}, Duration: ${testTimes}`
    return annotations
  }
}

export default CTestChecker
