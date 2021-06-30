import * as fs from 'fs'
import xmljs from 'xml-js'
import Checker from './abstract-checker'

class SpotbugsChecker extends Checker {
  private resultMessage: string = ''
  private summaryMessage: string = ''

  get checkerName(): string {
    return 'SpotBugs'
  }
  get input(): string {
    return 'spotbugs_input'
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
      totalBugs: 0
    }

    for (const inputFile of this.files) {
      const xml = fs.readFileSync(inputFile, 'UTF-8')
      const xmljsOption = {compact: true, instructionHasAttributes: true}
      const json = JSON.parse(xmljs.xml2json(xml, xmljsOption))

      await this.parseBugCollection(
        json.BugCollection,
        annotations,
        reportItems
      )
    }

    this.resultMessage = `[${this.checkerName}] ${reportItems.totalBugs} bugs found`
    this.summaryMessage = `Bugs: \`${reportItems.totalBugs}\``
    return annotations
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async parseBugCollection(
    bugCollection: any,
    annotations: any,
    reportItems: any
  ): Promise<any> {
    /* eslint-enable */
    const findBugsSummary = bugCollection.FindBugsSummary
    reportItems.totalBugs += Number(findBugsSummary._attributes.total_bugs)

    if (reportItems.totalBugs > 0) {
      const javaDir = await this.getJavaDir(bugCollection.Project.SrcDir)

      if (Array.isArray(bugCollection.BugInstance)) {
        for (const bugInstance of bugCollection.BugInstance) {
          await this.parseBugInstance(bugInstance, annotations, javaDir)
        }
      } else {
        if (bugCollection.BugInstance) {
          const bugInstance = bugCollection.BugInstance
          await this.parseBugInstance(bugInstance, annotations, javaDir)
        }
      }
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async getJavaDir(srcDirs: any): Promise<any> {
    /* eslint-enable */
    const searchPath = 'src/main/java'
    for (const srcDir of srcDirs) {
      const srcDirText = `${srcDir._text}`
      if (
        srcDirText.lastIndexOf(searchPath) + searchPath.length ===
        srcDirText.length
      ) {
        return srcDirText.substring(
          `${process.env.GITHUB_WORKSPACE}`.length + 1
        )
      }
    }
    return ''
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async parseBugInstance(
    bugInstance: any,
    annotations: any,
    javaDir: string
  ): Promise<any> {
    /* eslint-enable */
    if (Array.isArray(bugInstance.SourceLine)) {
      for (const sourceLine of bugInstance.SourceLine) {
        if (sourceLine._attributes.primary) {
          annotations.push(
            await this.createAnnotation(bugInstance, sourceLine, javaDir)
          )
          break
        }
      }
    } else {
      const sourceLine = bugInstance.SourceLine
      annotations.push(
        await this.createAnnotation(bugInstance, sourceLine, javaDir)
      )
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async createAnnotation(
    bugInstance: any,
    sourceLine: any,
    javaDir: string
  ): Promise<any> {
    /* eslint-enable */
    const path = `${javaDir}/${sourceLine._attributes.sourcepath}`
    const start_line = Number(sourceLine._attributes.start || 1)
    const end_line = Number(
      sourceLine._attributes.end || sourceLine._attributes.start || 1
    )
    const annotation_level: string =
      bugInstance._attributes.rank < 10 ? 'failure' : 'warning'
    const message: string = bugInstance.LongMessage._text
    const title = `${bugInstance._attributes.type} (Confidence:${bugInstance._attributes.priority}, Rank:${bugInstance._attributes.rank})`

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

export default SpotbugsChecker
