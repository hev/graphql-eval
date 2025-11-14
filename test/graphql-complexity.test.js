/**
 * GraphQL Complexity Estimation Tests
 *
 * This test suite evaluates the model's ability to estimate query complexity
 * and classify queries by their computational cost.
 */

const { runEval } = require('@vibecheck/runner');
const path = require('path');

describe('GraphQL Complexity Evaluation', () => {
  const evalPath = path.join(__dirname, '../evals/graphql-complexity.yml');

  test('should run complexity evaluation and pass all test cases', async () => {
    const results = await runEval(evalPath);

    expect(results).toBeDefined();
    expect(results.summary).toBeDefined();

    const passRate = results.summary.pass_rate;
    console.log(`GraphQL Complexity Eval - Pass Rate: ${passRate}%`);
    console.log(`Total Tests: ${results.summary.total_tests}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);

    // Assert acceptable pass rate
    expect(passRate).toBeGreaterThanOrEqual(85);
  });

  test('should classify simple queries as LOW complexity', async () => {
    const results = await runEval(evalPath);

    // Find simple query test cases
    const simpleTests = results.test_results.filter(
      test => test.expected_output === 'LOW'
    );

    expect(simpleTests.length).toBeGreaterThan(0);

    simpleTests.forEach(test => {
      if (test.grade === 'PASS') {
        expect(test.output).toMatch(/LOW/i);
      }
    });
  });

  test('should classify introspection queries as EXTREME complexity', async () => {
    const results = await runEval(evalPath);

    const introspectionTests = results.test_results.filter(
      test => test.expected_output === 'EXTREME'
    );

    expect(introspectionTests.length).toBeGreaterThan(0);

    introspectionTests.forEach(test => {
      if (test.grade === 'PASS') {
        expect(test.output).toMatch(/EXTREME/i);
      }
    });
  });

  test('should provide numeric complexity scores', async () => {
    const results = await runEval(evalPath);

    // Check that outputs include complexity scores
    results.test_results.forEach(test => {
      // Output should contain "COMPLEXITY:" followed by a number
      expect(test.output).toMatch(/COMPLEXITY:\s*\d+/i);
    });
  });

  test('should differentiate between complexity levels', async () => {
    const results = await runEval(evalPath);

    const classifications = results.test_results.map(test => {
      const match = test.output.match(/CLASSIFICATION:\s*(LOW|MEDIUM|HIGH|EXTREME)/i);
      return match ? match[1].toUpperCase() : null;
    });

    // Should have variety in classifications
    const uniqueClassifications = [...new Set(classifications.filter(Boolean))];
    expect(uniqueClassifications.length).toBeGreaterThanOrEqual(2);
  });
});
