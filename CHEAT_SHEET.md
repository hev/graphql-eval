# vibecheck GraphQL Eval - Cheat Sheet

Quick reference for common tasks and commands.

## Quick Start

```bash
npm install                  # Install dependencies
export VIBECHECK_API_KEY='...'  # Set API key
npm test                     # Run all evaluations
```

## npm Commands

```bash
npm test                     # Run all tests
npm run test:watch           # Auto-rerun on file changes
npm run test:coverage        # Generate coverage report
npm run test:verbose         # Verbose test output

# Run specific test file
npm test -- graphql-security.test.js

# Run tests matching pattern
npm test -- --testNamePattern="introspection"
```

## File Locations

```
evals/                       # Evaluation definitions (YAML)
test/                        # Jest test files
test-data/                   # Example GraphQL queries
examples/                    # Integration examples
```

## Adding a Test Case

Edit `evals/graphql-security.yml`:

```yaml
test_cases:
  - input: |
      query MyQuery {
        user(id: "123") {
          name
        }
      }
    expected_output: SAFE  # or DANGEROUS
```

Then run: `npm test`

## Creating New Evaluation

1. Create `evals/my-eval.yml`:
```yaml
name: my-eval
description: What it tests
model: claude-3-5-sonnet-20241022
system_prompt: |
  Instructions for the model
test_cases:
  - input: "test"
    expected_output: "result"
grader:
  type: llm_rubric
  rubric: "Grading instructions"
```

2. Create `test/my-eval.test.js`:
```javascript
const { runEval } = require('@vibecheck/runner');
const path = require('path');

describe('My Evaluation', () => {
  test('should pass', async () => {
    const results = await runEval(
      path.join(__dirname, '../evals/my-eval.yml')
    );
    expect(results.summary.pass_rate).toBeGreaterThanOrEqual(85);
  });
});
```

3. Run: `npm test`

## Common Patterns

### Check Pass Rate
```javascript
const results = await runEval(evalPath);
expect(results.summary.pass_rate).toBeGreaterThanOrEqual(90);
```

### Find Specific Test Results
```javascript
const introspectionTest = results.test_results.find(
  test => test.input.includes('__schema')
);
expect(introspectionTest.grade).toBe('PASS');
```

### Filter Failed Tests
```javascript
const failures = results.test_results.filter(
  test => test.grade === 'FAIL'
);
failures.forEach(f => console.log(f.input));
```

### Run Multiple Evals in Parallel
```javascript
const [security, complexity] = await Promise.all([
  runEval('./evals/graphql-security.yml'),
  runEval('./evals/graphql-complexity.yml')
]);
```

## Result Structure

```javascript
{
  summary: {
    total_tests: 8,
    passed: 7,
    failed: 1,
    pass_rate: 87.5
  },
  test_results: [
    {
      input: "GraphQL query",
      expected_output: "SAFE",
      output: "Model's response",
      grade: "PASS",
      score: 1.0
    }
  ]
}
```

## Environment Variables

```bash
# Required
VIBECHECK_API_KEY=sk-ant-...

# Optional
VIBECHECK_LOG_LEVEL=info
VIBECHECK_TIMEOUT=60000
```

## Debugging

### Enable Verbose Output
```bash
npm run test:verbose
```

### Run Single Test
```javascript
test.only('this specific test', async () => {
  // Only this test will run
});
```

### Skip Test Temporarily
```javascript
test.skip('skip this test', async () => {
  // This test will be skipped
});
```

### Increase Timeout
```javascript
test('long running test', async () => {
  // test code
}, 120000); // 2 minutes
```

## Common Issues

### "Cannot find module @vibecheck/runner"
```bash
npm install
```

### "VIBECHECK_API_KEY is not set"
```bash
export VIBECHECK_API_KEY='your-key'
```

### Tests timeout
Increase timeout in `jest.config.js`:
```javascript
testTimeout: 120000  // 2 minutes
```

### Low pass rate
1. Check failed test outputs
2. Review grading rubric
3. Adjust test cases if needed

## Security Patterns Detected

- ✅ Schema introspection (`__schema`, `__type`)
- ✅ Deep nesting (>5 levels)
- ✅ Batch attacks (>10 aliases)
- ✅ Missing pagination
- ✅ Circular queries
- ✅ Expensive operations

## Complexity Levels

- **LOW** (0-20): Simple queries
- **MEDIUM** (21-50): Moderate queries
- **HIGH** (51-100): Complex queries
- **EXTREME** (>100): Should be rejected

## Cost Estimates

- Single test case: ~$0.001-0.005
- Full security eval (8 cases): ~$0.01-0.04
- Complete test suite: ~$0.02-0.08

## Helpful Commands

```bash
# Count test cases
grep -r "input:" evals/ | wc -l

# List all test files
find test/ -name "*.test.js"

# Check git status
git status

# View recent commits
git log --oneline -5

# Show file tree
find . -type f | grep -v node_modules | sort
```

## Quick Reference

| Task | Command |
|------|---------|
| Install | `npm install` |
| Test all | `npm test` |
| Test one | `npm test -- file.test.js` |
| Watch mode | `npm run test:watch` |
| Coverage | `npm run test:coverage` |
| Verbose | `npm run test:verbose` |

## Documentation Files

- `README.md` - Main documentation
- `QUICK_START.md` - 2-minute setup
- `USAGE_GUIDE.md` - Detailed usage
- `ARCHITECTURE.md` - System design
- `CONTRIBUTING.md` - How to contribute
- `CHEAT_SHEET.md` - This file

## Example Files

- `examples/custom-query-check.js` - Real-time validation
- `examples/advanced-integration.js` - Production patterns

## Test Data

- `test-data/safe-queries.graphql` - Safe query examples
- `test-data/dangerous-queries.graphql` - Attack examples

## Getting Help

1. Check documentation files
2. Review example code
3. Check vibecheck docs: https://github.com/hev/vibecheck
4. Open an issue

---

**Pro Tip**: Use `npm run test:watch` during development for instant feedback!
