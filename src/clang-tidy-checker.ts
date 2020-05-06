import * as fs from 'fs'
import Checker from './abstract-checker'

class ClangTidyChecker extends Checker {
  private resultMessage: string = ''

  get name(): string {
    return 'Clang-Tidy'
  }
  get input(): string {
    return 'clang-tidy-input'
  }
  get result(): string {
    return this.resultMessage
  }
  get summary(): string {
    return this.resultMessage
  }

  /* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any */
  parse() {
    const annotations: any[] = []
    /* eslint-enable */

    for (const inputFile of this.files) {
      const lines = fs.readFileSync(inputFile, 'UTF-8').split(/\r?\n/)
      for (const line of lines) {
        const result = line.match(
          /^\s*(?:\d+%)?([^%]*?):(\d+):(?:(\d+):)?(?:(?:\{\d+:\d+-\d+:\d+\})+:)?\s*(warning|[^[\]]*error):\s*(.*?)(?:\[([^[]*)\])?$/
        )
        if (!result) {
          continue
        }

        const relativePath = result[1].substring(
          `${process.env.GITHUB_WORKSPACE}`.length + 1
        )
        const annotation = {
          path: relativePath,
          start_line: result[2],
          end_line: result[2],
          start_column: result[3],
          end_column: result[3],
          annotation_level: result[4] === 'error' ? 'failure' : result[4],
          message: result[5],
          title: result[6]
        }
        annotations.push(annotation)
      }
    }
    this.resultMessage = `[${this.name}] ${annotations.length} warnings`
    return annotations
  }
}

export default ClangTidyChecker
