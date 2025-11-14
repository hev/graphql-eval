# Quick Start Guide

Get the GraphQL Security Evaluation Suite running in under 2 minutes.

## Prerequisites

- Node.js 18+ installed
- Anthropic API key ([get one here](https://console.anthropic.com/))

## Setup Steps

### 1. Clone and Install

```bash
git clone <repository-url>
cd graphql-eval
npm install
```

### 2. Configure API Key

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```
ANTHROPIC_API_KEY=your-actual-api-key-here
```

Or export it directly:

```bash
export ANTHROPIC_API_KEY='your-actual-api-key-here'
```

### 3. Run Tests

```bash
npm test
```

You should see output like:

```
PASS  test/graphql-security.test.js
  GraphQL Security Evaluation
    ✓ should run security evaluation and pass all test cases (2500ms)
    ✓ should detect dangerous introspection queries (2100ms)
    ✓ should detect deep nesting attacks (2000ms)
    ...

PASS  test/graphql-complexity.test.js
  GraphQL Complexity Evaluation
    ✓ should run complexity evaluation and pass all test cases (2300ms)
    ...

Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
```

## What Just Happened?

You just ran GraphQL security evaluations using Vibecheck's programmatic runner! The tests:

1. Loaded evaluation definitions from `evals/` directory
2. Executed them using the `@vibecheck/runner` npm package
3. Validated that the AI model correctly identifies security vulnerabilities
4. Reported results in standard Jest format

## Next Steps

- **Review the evaluations**: Check `evals/graphql-security.yml` to see what patterns are detected
- **Examine test queries**: Look at `test-data/dangerous-queries.graphql` for attack examples
- **Add your own tests**: Follow the examples in `CONTRIBUTING.md`
- **Integrate with CI/CD**: Use the GitHub Actions workflow in `.github/workflows/`

## Troubleshooting

### "Cannot find module '@vibecheck/runner'"

Run `npm install` to install dependencies.

### "ANTHROPIC_API_KEY is not set"

Make sure you've set the environment variable:

```bash
export ANTHROPIC_API_KEY='your-key'
```

### Tests are slow

This is normal! Each test makes LLM API calls. Expect 1-3 seconds per test case.

## Key Files

- `package.json` - Dependencies and scripts
- `evals/*.yml` - Evaluation definitions (Vibecheck DSL)
- `test/*.test.js` - Jest test suites
- `test-data/*.graphql` - Example queries

## Learn More

See [README.md](README.md) for comprehensive documentation.
