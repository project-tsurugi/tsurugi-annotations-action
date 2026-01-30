# tsurugi-annotations-action

This GitHub action generates check-run annotations from outputs of static analysis tools and testing frameworks.

It is mainly focused on CI inside project-tsurugi projects, but can be used for other projects as well.

## Prerequisites

- Grant permissions for the GITHUB_TOKEN
  - scope: checks
  - access: write

```yaml

jobs:
  Build:
    permissions:
        checks: write
...
```

## Usage

Simple usage
```yaml
    steps:
      - name: Verify
        uses: project-tsurugi/tsurugi-annotations-action@v1
```

With configurations
```yaml
    steps:

      - name: Verify
        uses: project-tsurugi/tsurugi-annotations-action@v1
        if: always()
        with:
          junit_input: 'java/cost-accounting-benchmark/build/test-results/**/TEST-*.xml'
          junit_test_src_dir: 'java/cost-accounting-benchmark/src/test/java'
          spotbugs_input: 'java/cost-accounting-benchmark/build/reports/spotbugs/main/*.xml'
```

## Output
- Generate Check Run If there are warnings output by supporting tools/frameworks.
  - example: https://github.com/project-tsurugi/sharksfin/runs/17161949649
- Generate Job Summary if warnings present.
  - example: https://github.com/project-tsurugi/sharksfin/actions/runs/6320027242/attempts/1#summary-17161928275

## Supporting tools/frameworks

- [Clang-Tidy](https://clang.llvm.org/extra/clang-tidy/)
- [CTest](https://cmake.org/cmake/help/latest/manual/ctest.1.html)
- [Doxygen](https://www.doxygen.nl/)
- [Junit](https://junit.org/)
- [SpotBugs](https://spotbugs.github.io/)
- [Checkstyle](https://checkstyle.sourceforge.io/)

## Configurations (Actions input)

| Name               | Type    | Default                | Description                        |
|--------------------|---------|-------------|------------------------------------|
| `github_token`     | string  | `${{ github.token }}`  | Use this if you wish to use a different GitHub token than the one provided by the workflow. |
| `strict`           | bool    | `true`      | If annotation exists, set action to fail. |
| `clang_tidy_input` | string    | `build/clang-tidy.log`      | input file of generating Clang-Tidy annotation. |
| `ctest_input`      | string    | `build/**/*_gtest_result.xml`      | input file of generating CTest annotation. |
| `doxygen_input`    | string    | `build/doxygen-error.log`      | input file of generating Doxygen annotation. |
| `junit_input`      | string    | `build/test-results/**/TEST-*.xml`      | input file of generating JUnit annotation. |
| `spotbugs_input`   | string    | `build/reports/spotbugs/main/*.xml`     | input file of generating SpotBugs annotation. |
| `checkstyle_input` | string    | `build/reports/checkstyle/main.xml`     | input file of generating SpotBugs annotation. |
| `junit_test_src_dir` | string    | `src/test/java`     | test source root directory. |
| `matrix` | bool    | `false`     | matrix context. |
| `checker` | string  | empty string (Search for all supporting tool outputs) | enabled checker list (comma separated string) |

## License

[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
