import * as core from '@actions/core'
import * as glob from '@actions/glob'

abstract class Checker {
  files: string[] = []

  abstract get name(): string
  abstract get input(): string
  abstract get result(): string
  abstract get summary(): string
  public abstract parse(): any /* eslint-disable-line @typescript-eslint/no-explicit-any */

  async doIf(): Promise<boolean> {
    const patterns = core.getInput(this.input)
    const globber = await glob.create(patterns)
    this.files = await globber.glob()
    if (this.files.length) {
      core.info(`[${this.name}] files: ${this.files}`)
      return true
    } else {
      core.info(`[${this.name}] ${this.input} file does not exist: ${patterns}`)
      return false
    }
  }
}

export default Checker
