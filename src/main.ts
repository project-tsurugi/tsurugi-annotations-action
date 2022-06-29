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
    const checksCreate = core.getInput('checks_create')

    const octokit = github.getOctokit(accessToken)
    const sha =
      github.context.payload.pull_request?.head.sha ?? github.context.sha

    let ghaWarningMessage = ''
    for (const checker of checkers) {
      if (!(await checker.doIf())) continue

      const annotations = await checker.parse()
      core.info(checker.result)

      if (annotations.length) {
        ghaWarningMessage += `${checker.result} `

        if (checksCreate === 'update') {
          let checkSummary = checker.summary
          if (annotations.length > MAX_ANNOTATIONS_PER_REQUEST) {
            checkSummary += `\n(show only the first ${MAX_ANNOTATIONS_PER_REQUEST} annotations)`
          }
          // FIXME check_name is invalid when matrix build
          const req = {
            ...github.context.repo,
            ref: sha,
            check_name: `${process.env.GITHUB_JOB}`
          }
          const res = await octokit.checks.listForRef(req)
          if (res.data.check_runs[0]) {
            const check_run_id = res.data.check_runs[0].id
            const update_req = Object.assign({}, github.context.repo, {
              check_run_id,
              output: {
                title: checker.result,
                summary: checkSummary,
                annotations: annotations.slice(0, MAX_ANNOTATIONS_PER_REQUEST)
              }
            })
            await octokit.checks.update(update_req)
          } else {
            core.warning(
              'Failed to checks.update due to fail to get check runs.'
            )
          }
        } else {
          let checkSummary = checker.summary
          if (annotations.length > MAX_ANNOTATIONS_PER_REQUEST) {
            checkSummary += `\n(show only the first ${MAX_ANNOTATIONS_PER_REQUEST} annotations)`
          }
          let checkName = checker.name
          if (github.context.eventName === 'pull_request') {
            checkName = `${checkName}-pr`
          }
          octokit.checks.create({
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
        }
      }
    }
    if (ghaWarningMessage) {
      core.exportVariable('GHA_WARNING_MESSAGE', ghaWarningMessage)
      await core.summary.addCodeBlock(ghaWarningMessage).write()
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
