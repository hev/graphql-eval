# GraphQL Security Evaluation Suite

An example of using the Vibecheck DSL for assessing LLM generated GraphQL queries for safety and security.

> **Note**: Vibecheck is currently in developer preview. See [github.com/hev/vibecheck](https://github.com/hev/vibecheck) for more information.

## Quick Start

Get up and running in 3 commands:

```bash
# 1. Clone the repository
git clone <repository-url>
cd graphql-eval

# 2. Install dependencies (includes Vibecheck runner)
npm install

# 3. Run the evaluations
npm test
```

That's it! The evaluations will run and you'll see results in standard Jest output format.

## What This Evaluates

This suite includes two comprehensive GraphQL security evaluations:

### 1. GraphQL Security Check (`graphql-security.yml`)

Detects dangerous query patterns including:

- **Depth Attacks**: Deeply nested queries causing exponential resource consumption
- **Introspection Abuse**: Schema introspection queries that leak sensitive information
- **Batch Attacks**: Excessive aliasing/batching for DoS attacks
- **Recursive Queries**: Circular relationship queries without depth limits
- **Missing Pagination**: Large list queries without proper limits
- **Expensive Operations**: Computationally expensive fields without controls

### 2. Query Complexity Estimation (`graphql-complexity.yml`)

Estimates computational cost of queries and classifies them as:

- **LOW** (0-20): Simple, fast queries
- **MEDIUM** (21-50): Moderate complexity, acceptable
- **HIGH** (51-100): Complex queries requiring rate limiting
- **EXTREME** (>100): Should be rejected or heavily throttled

## Repository Structure

```
graphql-eval/
├── evals/                          # Vibecheck evaluation definitions
│   ├── graphql-security.yml        # Security vulnerability detection
│   └── graphql-complexity.yml      # Query complexity estimation
├── test/                           # Jest test suites
│   ├── graphql-security.test.js    # Security eval tests
│   └── graphql-complexity.test.js  # Complexity eval tests
├── test-data/                      # Example GraphQL queries
│   ├── safe-queries.graphql        # Examples of secure queries
│   └── dangerous-queries.graphql   # Examples of attack patterns
├── package.json                    # Dependencies including @vibecheck/runner
├── jest.config.js                  # Jest configuration
└── README.md                       # This file
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
npm test -- graphql-security.test.js
npm test -- graphql-complexity.test.js
```

### Run in Watch Mode

```bash
npm run test:watch
```

### Run with Coverage

```bash
npm run test:coverage
```

### Verbose Output

```bash
npm run test:verbose
```

## Understanding the Results

When you run `npm test`, you'll see Jest output with details about each evaluation:

```
GraphQL Security Evaluation
  ✓ should run security evaluation and pass all test cases (2500ms)
  ✓ should detect dangerous introspection queries (2100ms)
  ✓ should detect deep nesting attacks (2000ms)
  ✓ should detect batch/alias attacks (1900ms)
  ✓ should allow safe queries (2200ms)
  ✓ should provide detailed security analysis (2000ms)

GraphQL Complexity Evaluation
  ✓ should run complexity evaluation and pass all test cases (2300ms)
  ✓ should classify simple queries as LOW complexity (2100ms)
  ✓ should classify introspection queries as EXTREME complexity (2000ms)
  ✓ should provide numeric complexity scores (1950ms)
  ✓ should differentiate between complexity levels (2050ms)
```

Each test validates specific aspects of the evaluation:

- **Pass rates**: Overall evaluation performance
- **Pattern detection**: Ability to identify specific attack vectors
- **Classification accuracy**: Correct categorization of queries
- **Output quality**: Detailed explanations and analysis

## How It Works

The tests use the `@vibecheck/runner` package to execute evaluations:

```javascript
const { runEval } = require('@vibecheck/runner');
const path = require('path');

// Run an evaluation file
const evalPath = path.join(__dirname, '../evals/graphql-security.yml');
const results = await runEval(evalPath);

// Access results
console.log(`Pass Rate: ${results.summary.pass_rate}%`);
console.log(`Total Tests: ${results.summary.total_tests}`);

// Inspect individual test results
results.test_results.forEach(test => {
  console.log(`Input: ${test.input}`);
  console.log(`Output: ${test.output}`);
  console.log(`Grade: ${test.grade}`);
});
```

### Integration with Jest

The Jest tests wrap the Vibecheck runner and provide additional validation:

1. **Run the evaluation**: Execute the Vibecheck eval using `runEval()`
2. **Parse results**: Extract pass rates, individual test results, and outputs
3. **Assert expectations**: Validate that the model correctly identifies patterns
4. **Provide feedback**: Clear error messages when tests fail

## Customization

### Adding New Test Cases

Edit the YAML files in `evals/` to add new test cases:

```yaml
test_cases:
  - input: |
      query YourNewQuery {
        # Your GraphQL query here
      }
    expected_output: SAFE  # or DANGEROUS
```

### Modifying Pass Rate Thresholds

In the test files, adjust the pass rate requirements:

```javascript
// Current: 90% pass rate required
expect(passRate).toBeGreaterThanOrEqual(90);

// Stricter: 95% pass rate
expect(passRate).toBeGreaterThanOrEqual(95);
```

### Adding New Evaluations

1. Create a new YAML file in `evals/`
2. Create a corresponding test file in `test/`
3. Run `npm test` to verify

## Environment Variables

Set your Vibecheck API key before running tests:

```bash
export VIBECHECK_API_KEY='your-api-key-here'
npm test
```

Or use a `.env` file (not committed to git):

```bash
echo "VIBECHECK_API_KEY=your-api-key-here" > .env
```

## Example Queries

The `test-data/` directory contains example queries for reference:

### Safe Queries (`safe-queries.graphql`)

- Simple user lookups
- Paginated listings
- Controlled nesting depth
- Reasonable field selection

### Dangerous Queries (`dangerous-queries.graphql`)

- Schema introspection attacks
- Deep nesting attacks
- Batch/alias attacks
- Missing pagination
- Circular relationships

Use these examples to understand what patterns the evaluations detect.

## Performance Considerations

- **Test Duration**: Each evaluation makes LLM API calls, so tests take 1-3 seconds each
- **Timeout**: Jest timeout is set to 60 seconds to accommodate LLM latency
- **Parallel Execution**: Jest runs tests in parallel by default for better performance
- **Cost**: Each test case incurs minimal API costs (fractions of a cent with Claude models)

## Troubleshooting

### Tests Timeout

Increase the Jest timeout in `jest.config.js`:

```javascript
testTimeout: 120000, // 2 minutes
```

### API Key Issues

Ensure your `VIBECHECK_API_KEY` environment variable is set:

```bash
echo $VIBECHECK_API_KEY  # Should print your key
```

### Failed Test Cases

If evaluations fail:

1. Check the test output for specific failures
2. Review the model's output vs. expected output
3. Consider adjusting the grading rubric in the YAML file
4. Verify your test cases are well-defined

## Next Steps

1. **Run the tests**: `npm test` to see it in action
2. **Review results**: Check which patterns are detected correctly
3. **Customize**: Add your own GraphQL queries and test cases
4. **Integrate**: Add to your CI/CD pipeline
5. **Iterate**: Refine evaluations based on results

## Support

For questions about:

- **Vibecheck**: See [Vibecheck documentation](https://github.com/hev/vibecheck)
- **GraphQL Security**: Review [GraphQL Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html)

## License

MIT
