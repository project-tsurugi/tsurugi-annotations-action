import * as core from '@actions/core'
import * as fs from 'fs'
import xmljs from 'xml-js'
import Checker from './abstract-checker'

class JUnitChecker extends Checker {
  private resultMessage: string = ''
  private summaryMessage: string = ''

  get checkerName(): string {
    return 'JUnit'
  }
  get input(): string {
    return 'junit_input'
  }
  get result(): string {
    return this.resultMessage
  }
  get summary(): string {
    return this.summaryMessage
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async parse(): Promise<any> {
    const annotations: any[] = []
    /* eslint-enable */
    const reportItems = {
      numTests: 0,
      numErrors: 0,
      numFailures: 0,
      numSkipped: 0,
      testTimes: 0
    }

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

      if (Array.isArray(testsuite)) {
        for (const ts of testsuite) {
          await this.parseTestsuite(ts, annotations, reportItems)
        }
      } else {
        await this.parseTestsuite(testsuite, annotations, reportItems)
      }
    }

    const numFailureAndError = reportItems.numFailures + reportItems.numErrors
    this.resultMessage = `[${this.checkerName}] ${numFailureAndError} test failed`
    this.summaryMessage = `Tests: \`${reportItems.numTests}\` Failures: \`${reportItems.numFailures}\` Errors: \`${reportItems.numErrors}\` Skipped: \`${reportItems.numSkipped}\` Duration: \`${reportItems.testTimes}\`s`
    return annotations
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async parseTestsuite(
    testsuite: any,
    annotations: any,
    reportItems: any
  ): Promise<any> {
    /* eslint-enable */
    reportItems.numTests += Number(testsuite._attributes.tests || 0)
    reportItems.numErrors += Number(testsuite._attributes.errors || 0)
    reportItems.numFailures += Number(testsuite._attributes.failures || 0)
    reportItems.numSkipped += testsuite._attributes.skipped
      ? Number(testsuite._attributes.skipped || 0)
      : Number(testsuite._attributes.disabled || 0)
    reportItems.testTimes += Number(testsuite._attributes.time || 0)

    if (Array.isArray(testsuite.testcase)) {
      for (const testcase of testsuite.testcase) {
        await this.parseTestCase(testcase, annotations)
      }
    } else {
      await this.parseTestCase(testsuite.testcase, annotations)
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async parseTestCase(testcase: any, annotations: any): Promise<any> {
    /* eslint-enable */
    if (Array.isArray(testcase.failure)) {
      for (const failure of testcase.failure) {
        annotations.push(await this.createAnnotation(testcase, failure))
      }
    } else {
      if (testcase.failure) {
        annotations.push(
          await this.createAnnotation(testcase, testcase.failure)
        )
      }
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async createAnnotation(testcase: any, failure: any): Promise<any> {
    /* eslint-enable */
    const message: string = failure._attributes.message
    const classname: string = testcase._attributes.classname
    const klass = classname.replace(/$.*/g, '').replace(/\./g, '/')
    const path = `${core.getInput('junit_test_src_dir')}/${klass}.java`

    return {
      path,
      start_line: 1,
      end_line: 1,
      annotation_level: 'failure',
      message,
      title: `${classname}.${testcase._attributes.name}`
    }
  }
}

export default JUnitChecker
