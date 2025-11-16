/**
 * GraphQL Security Evaluation Tests
 *
 * Uses the @vibecheck/runner npm package to run evaluations
 * programmatically with `npm test`.
 */

const { runEval } = require('@vibecheck/runner');
const path = require('path');

describe('GraphQL Security Evaluation', () => {
  const evalPath = path.join(__dirname, '../evals/graphql-security.yml');

  test('should run security evaluation and pass all test cases', async () => {
    // Run the evaluation programmatically using vibecheck's npm runner
    const results = await runEval(evalPath);

    // Verify the evaluation completed successfully
    expect(results).toBeDefined();
    expect(results.summary).toBeDefined();

    // Check that all test cases passed
    const passRate = results.summary.pass_rate;
    console.log(`GraphQL Security Eval - Pass Rate: ${passRate}%`);
    console.log(`Total Tests: ${results.summary.total_tests}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);

    // Assert minimum acceptable pass rate (adjust based on your requirements)
    expect(passRate).toBeGreaterThanOrEqual(90);
  });

  test('should detect dangerous introspection queries', async () => {
    const results = await runEval(evalPath);

    // Find the introspection test case result
    const introspectionTest = results.test_results.find(
      test => test.input.includes('__schema')
    );

    expect(introspectionTest).toBeDefined();
    expect(introspectionTest.grade).toBe('PASS');

    // The model should have identified this as DANGEROUS
    expect(introspectionTest.output).toMatch(/DANGEROUS/i);
  });

  test('should detect deep nesting attacks', async () => {
    const results = await runEval(evalPath);

    // Find the deep nesting test case
    const deepNestingTest = results.test_results.find(
      test => test.input.includes('DeepNesting')
    );

    expect(deepNestingTest).toBeDefined();
    expect(deepNestingTest.grade).toBe('PASS');
    expect(deepNestingTest.output).toMatch(/DANGEROUS/i);
  });

  test('should detect batch/alias attacks', async () => {
    const results = await runEval(evalPath);

    // Find the batch attack test case
    const batchTest = results.test_results.find(
      test => test.input.includes('user15')
    );

    expect(batchTest).toBeDefined();
    expect(batchTest.grade).toBe('PASS');
    expect(batchTest.output).toMatch(/DANGEROUS/i);
  });

  test('should allow safe queries', async () => {
    const results = await runEval(evalPath);

    // Find safe query test cases
    const safeTests = results.test_results.filter(
      test => test.expected_output === 'SAFE'
    );

    expect(safeTests.length).toBeGreaterThan(0);

    // All safe queries should pass
    safeTests.forEach(test => {
      expect(test.grade).toBe('PASS');
      expect(test.output).toMatch(/SAFE/i);
    });
  });

  test('should provide detailed security analysis', async () => {
    const results = await runEval(evalPath);

    // All results should include explanations
    results.test_results.forEach(test => {
      expect(test.output).toBeDefined();
      expect(test.output.length).toBeGreaterThan(10); // Should have meaningful content
    });
  });
});
