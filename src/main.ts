import * as core from '@actions/core'
import * as github from '@actions/github'
import Checker from './abstract-checker'
import ClangTidyChecker from './clang-tidy-checker'
import CTestChecker from './ctest-checker'
import DoxygenChecker from './doxygen-checker'
import JUnitChecker from './junit-checker'

async function main(): Promise<void> {
  try {
    const checkers: Checker[] = [
      new CTestChecker(),
      new ClangTidyChecker(),
      new DoxygenChecker(),
      new JUnitChecker()
    ]

    const MAX_ANNOTATIONS_PER_REQUEST = 50
    const accessToken = `${process.env.GITHUB_TOKEN}`
    const checksCreate = core.getInput('checks-create')

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

        // TODO workaround: checks.create cannot create new checks page from pull_request event
        if (
          github.context.eventName === 'pull_request' ||
          checksCreate === 'update'
        ) {
          let checkSummary = checker.summary
          if (annotations.length > MAX_ANNOTATIONS_PER_REQUEST) {
            checkSummary += `\n(show only the first ${MAX_ANNOTATIONS_PER_REQUEST} annotations)`
          }
          const req = {
            ...github.context.repo,
            ref: sha,
            check_name: `${process.env.GITHUB_JOB}`
          }
          const res = await octokit.checks.listForRef(req)
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
          let checkSummary = checker.summary
          if (annotations.length > MAX_ANNOTATIONS_PER_REQUEST) {
            checkSummary += `\n(show only the first ${MAX_ANNOTATIONS_PER_REQUEST} annotations)`
          }
          octokit.checks.create({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            name: checker.name,
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
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
