# Vibecheck Programmatic Runner - Usage Guide

This guide provides comprehensive examples of using Vibecheck's programmatic runner for GraphQL security evaluations.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Running Tests](#running-tests)
- [Understanding Results](#understanding-results)
- [Advanced Patterns](#advanced-patterns)
- [Integration Examples](#integration-examples)
- [Best Practices](#best-practices)

## Basic Usage

### Running a Single Evaluation

```javascript
const { runEval } = require('@vibecheck/runner');
const path = require('path');

async function runSecurityCheck() {
  const evalPath = path.join(__dirname, 'evals/graphql-security.yml');
  const results = await runEval(evalPath);

  console.log('Pass Rate:', results.summary.pass_rate);
  console.log('Total Tests:', results.summary.total_tests);
  console.log('Passed:', results.summary.passed);
  console.log('Failed:', results.summary.failed);

  return results;
}
```

### Jest Integration

```javascript
const { runEval } = require('@vibecheck/runner');

describe('GraphQL Security', () => {
  test('should detect dangerous patterns', async () => {
    const results = await runEval('./evals/graphql-security.yml');

    // Assert minimum pass rate
    expect(results.summary.pass_rate).toBeGreaterThanOrEqual(90);

    // Check individual test results
    results.test_results.forEach(test => {
      if (test.grade === 'FAIL') {
        console.log('Failed test:', test.input);
        console.log('Expected:', test.expected_output);
        console.log('Got:', test.output);
      }
    });
  });
});
```

## Running Tests

### Standard Test Run

```bash
npm test
```

Output:
```
PASS  test/graphql-security.test.js
  GraphQL Security Evaluation
    ✓ should run security evaluation and pass all test cases (2500ms)
    ✓ should detect dangerous introspection queries (2100ms)

Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
```

### Watch Mode (for development)

```bash
npm run test:watch
```

This will re-run tests whenever files change.

### Specific Test File

```bash
npm test -- graphql-security.test.js
```

### With Coverage

```bash
npm run test:coverage
```

### Verbose Output

```bash
npm run test:verbose
```

## Understanding Results

### Result Structure

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
      input: "query GetUser { user(id: \"123\") { name } }",
      expected_output: "SAFE",
      output: "SAFE: This is a simple, well-scoped query...",
      grade: "PASS",
      score: 1.0
    },
    {
      input: "query Introspection { __schema { types { name } } }",
      expected_output: "DANGEROUS",
      output: "DANGEROUS: Schema introspection detected...",
      grade: "PASS",
      score: 1.0
    },
    // ... more test results
  ]
}
```

### Interpreting Grades

- **PASS**: Model correctly identified the security classification
- **FAIL**: Model misclassified the query

### Test Result Fields

- `input`: The GraphQL query being tested
- `expected_output`: What we expect the model to say (SAFE/DANGEROUS)
- `output`: The model's actual response
- `grade`: PASS or FAIL
- `score`: Numeric score (1.0 for pass, 0.0 for fail)

## Advanced Patterns

### Pattern 1: Parallel Evaluation Execution

```javascript
async function runAllEvaluations() {
  const evals = [
    './evals/graphql-security.yml',
    './evals/graphql-complexity.yml'
  ];

  const results = await Promise.all(
    evals.map(path => runEval(path))
  );

  return results;
}
```

### Pattern 2: Conditional Testing

```javascript
test('should handle complex queries differently', async () => {
  const results = await runEval('./evals/graphql-security.yml');

  const introspectionTests = results.test_results.filter(
    test => test.input.includes('__schema')
  );

  const regularTests = results.test_results.filter(
    test => !test.input.includes('__schema')
  );

  expect(introspectionTests.every(t => t.output.includes('DANGEROUS'))).toBe(true);
  expect(regularTests.some(t => t.output.includes('SAFE'))).toBe(true);
});
```

### Pattern 3: Custom Assertions

```javascript
function assertSecurityDetection(results, pattern, shouldDetect = true) {
  const relevantTests = results.test_results.filter(
    test => test.input.includes(pattern)
  );

  expect(relevantTests.length).toBeGreaterThan(0);

  if (shouldDetect) {
    expect(relevantTests.every(t => t.output.includes('DANGEROUS'))).toBe(true);
  } else {
    expect(relevantTests.every(t => t.output.includes('SAFE'))).toBe(true);
  }
}

// Usage
test('detects introspection', async () => {
  const results = await runEval('./evals/graphql-security.yml');
  assertSecurityDetection(results, '__schema', true);
});
```

### Pattern 4: Result Caching

```javascript
const cache = new Map();

async function runEvalWithCache(evalPath) {
  if (cache.has(evalPath)) {
    console.log('Using cached results for:', evalPath);
    return cache.get(evalPath);
  }

  console.log('Running evaluation:', evalPath);
  const results = await runEval(evalPath);
  cache.set(evalPath, results);

  return results;
}
```

## Integration Examples

### Express Middleware

```javascript
const { runEval } = require('@vibecheck/runner');

async function graphqlSecurityMiddleware(req, res, next) {
  const query = req.body.query;

  // For production, you'd want to create a dynamic eval
  // or use a dedicated query-checking endpoint

  try {
    // Simplified check (expand for production use)
    if (query.includes('__schema') || query.includes('__type')) {
      return res.status(403).json({
        error: 'Schema introspection is not allowed in production'
      });
    }

    next();
  } catch (error) {
    console.error('Security check error:', error);
    next(); // Fail open
  }
}

app.post('/graphql', graphqlSecurityMiddleware, graphqlHandler);
```

### Monitoring Integration

```javascript
const { runEval } = require('@vibecheck/runner');

async function runAndReport() {
  const results = await runEval('./evals/graphql-security.yml');

  // Send metrics to Datadog
  const metrics = {
    'graphql.security.pass_rate': results.summary.pass_rate,
    'graphql.security.total_tests': results.summary.total_tests,
    'graphql.security.failures': results.summary.failed
  };

  // reportToDatadog(metrics);
  // reportToPrometheus(metrics);

  // Alert if pass rate drops
  if (results.summary.pass_rate < 90) {
    // sendSlackAlert(`Security eval pass rate dropped to ${results.summary.pass_rate}%`);
  }

  return results;
}
```

## Best Practices

### 1. Set Appropriate Timeouts

Jest tests that use LLM calls need longer timeouts:

```javascript
// In jest.config.js
module.exports = {
  testTimeout: 60000, // 60 seconds
};

// Or per-test
test('security check', async () => {
  // ...
}, 120000); // 2 minutes for this specific test
```

### 2. Use Descriptive Test Names

```javascript
// Good
test('should detect schema introspection as dangerous', async () => {

// Better
test('should classify __schema queries as DANGEROUS security threat', async () => {
```

### 3. Test Both Positive and Negative Cases

```javascript
describe('GraphQL Security', () => {
  test('should allow safe queries', async () => {
    // Test SAFE classification
  });

  test('should block dangerous queries', async () => {
    // Test DANGEROUS classification
  });
});
```

### 4. Use Focused Test Filters

```javascript
test.only('debug this specific test', async () => {
  // This will run only this test
});

test.skip('skip this test temporarily', async () => {
  // This test will be skipped
});
```

### 5. Environment-Specific Configuration

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';
const passRateThreshold = isDevelopment ? 70 : 90;

expect(results.summary.pass_rate).toBeGreaterThanOrEqual(passRateThreshold);
```

### 6. Proper Error Handling

```javascript
test('should handle eval failures gracefully', async () => {
  try {
    const results = await runEval('./evals/graphql-security.yml');
    expect(results).toBeDefined();
  } catch (error) {
    // Log the error for debugging
    console.error('Evaluation failed:', error);

    // Decide whether to fail the test or handle gracefully
    if (error.message.includes('API_KEY')) {
      throw new Error('Missing API key - check environment variables');
    }

    throw error;
  }
});
```

### 7. Result Validation

```javascript
function validateResults(results) {
  expect(results).toBeDefined();
  expect(results.summary).toBeDefined();
  expect(results.summary.total_tests).toBeGreaterThan(0);
  expect(results.test_results).toBeInstanceOf(Array);
  expect(results.test_results.length).toBe(results.summary.total_tests);
}

test('results have expected structure', async () => {
  const results = await runEval('./evals/graphql-security.yml');
  validateResults(results);
});
```

## Troubleshooting

### Common Issues

**Issue**: Tests timeout
**Solution**: Increase timeout in jest.config.js or per-test

**Issue**: Inconsistent results
**Solution**: Check your test cases and grading rubric for ambiguity

**Issue**: Low pass rates
**Solution**: Review failed test outputs to understand model behavior

**Issue**: API errors
**Solution**: Verify VIBECHECK_API_KEY is set correctly

## Next Steps

- Review the [examples/](examples/) directory for more advanced patterns
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for adding new evaluations
- See [README.md](README.md) for complete documentation

## Resources

- [Vibecheck Documentation](https://github.com/hev/vibecheck)
- [Jest Documentation](https://jestjs.io/)
- [GraphQL Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html)
