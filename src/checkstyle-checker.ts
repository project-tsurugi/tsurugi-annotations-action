import * as fs from 'fs'
import xmljs from 'xml-js'
import Checker from './abstract-checker'

class CheckstyleChecker extends Checker {
  private resultMessage: string = ''
  private summaryMessage: string = ''

  get checkerName(): string {
    return 'Checkstyle'
  }
  get input(): string {
    return 'checkstyle_input'
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
      totalWarnings: 0
    }

    for (const inputFile of this.files) {
      const xml = fs.readFileSync(inputFile, 'UTF-8')
      const xmljsOption = {compact: true, instructionHasAttributes: true}
      const json = JSON.parse(xmljs.xml2json(xml, xmljsOption))

      await this.parseCheckstyle(json.checkstyle, annotations, reportItems)
    }

    this.resultMessage = `[${this.checkerName}] ${reportItems.totalWarnings} warnings found`
    this.summaryMessage = `Warnings: \`${reportItems.totalWarnings}\``
    return annotations
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async parseCheckstyle(
    checkstyle: any,
    annotations: any,
    reportItems: any
  ): Promise<any> {
    /* eslint-enable */
    if (Array.isArray(checkstyle.file)) {
      for (const file of checkstyle.file) {
        await this.parseFile(file, annotations, reportItems)
      }
    } else {
      if (checkstyle.file) {
        await this.parseFile(checkstyle.file, annotations, reportItems)
      }
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async parseFile(file: any, annotations: any, reportItems: any): Promise<any> {
    /* eslint-enable */
    if (Array.isArray(file.error)) {
      for (const error of file.error) {
        reportItems.totalWarnings++
        annotations.push(await this.createAnnotation(file, error))
      }
    } else {
      if (file.error) {
        reportItems.totalWarnings++
        annotations.push(await this.createAnnotation(file, file.error))
      }
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async createAnnotation(file: any, error: any): Promise<any> {
    /* eslint-enable */
    const fileName = `${file._attributes.name}`
    const path = fileName.substring(
      `${process.env.GITHUB_WORKSPACE}`.length + 1
    )

    const line = Number(error._attributes.line)
    const start_line = line
    const end_line = line

    const severity: string = error._attributes.severity
    const annotation_level = severity === 'error' ? 'failure' : 'warning'

    const message: string = error._attributes.message

    const source: string = error._attributes.source
    const checkstyleChecksPackage = 'com.puppycrawl.tools.checkstyle.checks.'
    const sourceIndex = source.includes(checkstyleChecksPackage)
      ? checkstyleChecksPackage.length
      : 0
    const title = source.substring(sourceIndex)

    return {
      path,
      start_line,
      end_line,
      annotation_level,
      message,
      title
    }
  }
}

export default CheckstyleChecker
