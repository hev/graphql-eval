# Contributing to the GraphQL Security Evaluation Suite

Thank you for your interest in improving your organization's GraphQL security evaluations!

## Adding New Test Cases

To add new GraphQL security test cases:

1. **Edit the evaluation file** (`evals/graphql-security.yml` or `evals/graphql-complexity.yml`)

2. **Add your test case** under `test_cases`:

```yaml
test_cases:
  - input: |
      query YourQuery {
        # Your GraphQL query here
      }
    expected_output: SAFE  # or DANGEROUS
```

3. **Run the tests** to verify:

```bash
npm test
```

4. **Commit your changes**:

```bash
git add evals/
git commit -m "Add test case for [describe the pattern]"
```

## Adding New Evaluations

To create a completely new evaluation:

1. **Create a new YAML file** in `evals/`:

```bash
touch evals/my-new-eval.yml
```

2. **Define the evaluation** following the Vibecheck DSL:

```yaml
name: my-new-eval
description: What this eval tests

model: claude-3-5-sonnet-20241022

system_prompt: |
  Your evaluation instructions here

test_cases:
  - input: "test input"
    expected_output: "expected result"

grader:
  type: llm_rubric
  rubric: |
    Grading criteria here
```

3. **Create a Jest test file** in `test/`:

```javascript
const { runEval } = require('@vibecheck/runner');
const path = require('path');

describe('My New Evaluation', () => {
  const evalPath = path.join(__dirname, '../evals/my-new-eval.yml');

  test('should run evaluation successfully', async () => {
    const results = await runEval(evalPath);
    expect(results.summary.pass_rate).toBeGreaterThanOrEqual(85);
  });
});
```

4. **Test and commit**:

```bash
npm test
git add evals/ test/
git commit -m "Add new evaluation for [purpose]"
```

## Code Style

- Use clear, descriptive test names
- Add comments explaining complex test logic
- Keep test cases focused on specific patterns
- Follow existing file structure and naming conventions

## Testing Guidelines

- Ensure all tests pass before submitting: `npm test`
- Aim for pass rates >= 85% for new evaluations
- Include both positive and negative test cases
- Test edge cases and boundary conditions

## Documentation

When adding features, update:

- `README.md` - If changing user-facing functionality
- `CONTRIBUTING.md` - If changing contribution process
- Code comments - For complex logic

## Questions?

Contact the your organization Security Team or open an issue.
