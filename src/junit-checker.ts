import * as core from '@actions/core'
import * as fs from 'fs'
import xmljs from 'xml-js'
import Checker from './abstract-checker'

class JUnitChecker extends Checker {
  private resultMessage: string = ''
  private summaryMessage: string = ''

  get name(): string {
    return 'JUnit'
  }
  get input(): string {
    return 'junit-input'
  }
  get result(): string {
    return this.resultMessage
  }
  get summary(): string {
    return this.summaryMessage
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async createAnnotation(testcase: any): Promise<any> {
    /* eslint-enable */
    const message: string = testcase.failure._attributes.message
    const classname: string = testcase._attributes.classname
    const klass = classname.replace(/$.*/g, '').replace(/\./g, '/')
    const path = `${core.getInput('junit-test-src-dir')}/${klass}.java`

    return {
      path,
      start_line: 1,
      end_line: 1,
      annotation_level: 'failure',
      message,
      title: `${classname}.${testcase._attributes.name}`
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async parse(): Promise<any> {
    const annotations: any[] = []
    /* eslint-enable */
    let numTests = 0
    let numErrors = 0
    let numFailures = 0
    let numSkipped = 0
    let testTimes = 0

    for (const inputFile of this.files) {
      const xml = fs.readFileSync(inputFile, 'UTF-8')
      const xmljsOption = {compact: true, instructionHasAttributes: true}
      const json = JSON.parse(xmljs.xml2json(xml, xmljsOption))
      let testsuite
      if (json.testsuites) {
        testsuite = json.testsuites.testsuite
      } else {
        testsuite = json.testsuite
      }
      if (!testsuite) {
        continue
      }
      numTests += Number(testsuite._attributes.tests)
      numErrors += Number(testsuite._attributes.errors)
      numFailures += Number(testsuite._attributes.failures)
      numSkipped += testsuite._attributes.skipped
        ? Number(testsuite._attributes.skipped)
        : Number(testsuite._attributes.disabled)
      testTimes += Number(testsuite._attributes.time)

      if (Array.isArray(testsuite.testcase)) {
        for (const testcase of testsuite.testcase) {
          if (testcase.failure) {
            annotations.push(await this.createAnnotation(testcase))
          }
        }
      } else {
        const testcase = testsuite.testcase
        if (testcase.failure) {
          annotations.push(await this.createAnnotation(testcase))
        }
      }
    }
    const numFailureAndError = numFailures + numErrors
    this.resultMessage = `[${this.name}] ${numFailureAndError} test failed`
    this.summaryMessage = `Tests: \`${numTests}\` Failures: \`${numFailures}\` Errors: \`${numErrors}\` Skipped: \`${numSkipped}\` Duration: \`${testTimes}\`s`
    return annotations
  }
}

export default JUnitChecker
