import * as core from '@actions/core'
import * as glob from '@actions/glob'

abstract class Checker {
  files: string[] = []

  INPUT_EXCLUDE_PATTERN = '!.github/**'

  abstract get checkerName(): string
  abstract get input(): string
  abstract get result(): string
  abstract get summary(): string

  get name(): string {
    const matrix = core.getInput('matrix')
    if (matrix == null || matrix === 'null' || matrix === '') {
      return this.checkerName
    } else {
      const value = Object.values(JSON.parse(matrix)).join(', ')
      return value !== '' ? `${this.checkerName} (${value})` : this.checkerName
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  abstract async parse(): Promise<any>
  /* eslint-enable */

  async doIf(): Promise<boolean> {
    const patterns = core.getInput(this.input)
    const globber = await glob.create(
      `${patterns}\n${this.INPUT_EXCLUDE_PATTERN}`
    )
    this.files = await globber.glob()
    if (this.files.length) {
      core.info(`[${this.name}] files: ${this.files}`)
      return true
    } else {
      core.debug(
        `[${this.name}] ${this.input} file does not exist: ${patterns}`
      )
      return false
    }
  }
}

export default Checker
