import * as core from '@actions/core'
import * as github from '@actions/github'
import Checker from './abstract-checker'
import ClangTidyChecker from './clang-tidy-checker'
import CTestChecker from './ctest-checker'
import DoxygenChecker from './doxygen-checker'
import JUnitChecker from './junit-checker'
import SpotbugsChecker from './spotbugs-checker'
import CheckstyleChecker from './checkstyle-checker'

async function main(): Promise<void> {
  try {
    let checkers: Checker[]
    const checkerInput = core.getInput('checker')
    if (
      checkerInput == null ||
      checkerInput === 'null' ||
      checkerInput === ''
    ) {
      checkers = [
        new CTestChecker(),
        new ClangTidyChecker(),
        new DoxygenChecker(),
        new JUnitChecker(),
        new SpotbugsChecker(),
        new CheckstyleChecker()
      ]
    } else {
      checkers = []
      for (const checker of checkerInput.split(',')) {
        switch (checker) {
          case 'ctest':
            checkers.push(new CTestChecker())
            break
          case 'clang_tidy':
            checkers.push(new ClangTidyChecker())
            break
          case 'doxygen':
            checkers.push(new DoxygenChecker())
            break
          case 'junit':
            checkers.push(new JUnitChecker())
            break
          case 'spotbugs':
            checkers.push(new SpotbugsChecker())
            break
          case 'checkstyle':
            checkers.push(new CheckstyleChecker())
            break
          default:
            throw new Error(`invalid checker: ${checker}`)
        }
      }
    }

    const MAX_ANNOTATIONS_PER_REQUEST = 50
    const accessToken =
      process.env.GITHUB_TOKEN ?? core.getInput('github_token')

    const octokit = github.getOctokit(accessToken)
    const sha =
      github.context.payload.pull_request?.head.sha ?? github.context.sha

    let ghaWarningMessage = ''
    for (const checker of checkers) {
      if (!(await checker.doIf())) continue

      const annotations = await checker.parse()
      core.info(checker.result)

      if (annotations.length) {
        let checkSummary = checker.summary
        if (annotations.length > MAX_ANNOTATIONS_PER_REQUEST) {
          checkSummary += `\n(show only the first ${MAX_ANNOTATIONS_PER_REQUEST} annotations)`
        }
        let checkName = checker.name
        if (github.context.eventName === 'pull_request') {
          checkName = `${checkName}-pr`
        }
        const res = await octokit.checks.create({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          name: checkName,
          head_sha: sha,
          status: 'completed',
          conclusion: annotations.length === 0 ? 'success' : 'failure',
          output: {
            title: checker.result,
            summary: checkSummary,
            annotations: annotations.slice(0, MAX_ANNOTATIONS_PER_REQUEST)
          }
        })
        const checkUrl = res.data.html_url
        await core.summary.addLink(checker.result, checkUrl as string).write()
        ghaWarningMessage += `\n- *<${checkUrl}?check_suite_focus=true|${checker.result}>*`
      }
    }
    if (ghaWarningMessage) {
      core.exportVariable('GHA_WARNING_MESSAGE', ghaWarningMessage)
      if ('true' === core.getInput('strict')) {
        core.setFailed(ghaWarningMessage)
      }
    }
  } catch (error) {
    core.setFailed(error.stack)
  }
}

main()
