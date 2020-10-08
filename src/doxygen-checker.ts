import * as fs from 'fs'
import Checker from './abstract-checker'

class DoxygenChecker extends Checker {
  private resultMessage: string = ''

  get name(): string {
    return 'Doxygen'
  }
  get input(): string {
    return 'doxygen_input'
  }
  get result(): string {
    return this.resultMessage
  }
  get summary(): string {
    return this.resultMessage
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async parse(): Promise<any> {
    const annotations: any[] = []
    /* eslint-enable */
    for (const inputFile of this.files) {
      const lines = fs.readFileSync(inputFile, 'UTF-8').split(/\r?\n/)
      for (const line of lines) {
        const result = line.match(
          /^\s*(?:\d+%)?([^%]*?):(\d+):(?:(\d+):)?(?:(?:\{\d+:\d+-\d+:\d+\})+:)?\s*(warning|[^[\]]*error):\s*(.*?)$/
        )
        if (!result) {
          continue
        }

        const relativePath = result[1].substring(
          `${process.env.GITHUB_WORKSPACE}`.length + 1
        )
        let warnLine = parseInt(result[2])
        if (isNaN(warnLine)) {
          warnLine = 1
        }
        let warnColumn = parseInt(result[3])
        if (isNaN(warnColumn)) {
          warnColumn = 1
        }

        const annotation = {
          path: relativePath,
          start_line: warnLine,
          end_line: warnLine,
          start_column: warnColumn,
          end_column: warnColumn,
          annotation_level: result[4] === 'error' ? 'failure' : result[4],
          message: result[5]
        }
        annotations.push(annotation)
      }
    }
    this.resultMessage = `[${this.name}] ${annotations.length} warnings`
    return annotations
  }
}

export default DoxygenChecker
