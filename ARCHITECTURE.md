# Architecture Overview

This document describes the architecture of the GraphQL Security Evaluation Suite and how it leverages Vibecheck's programmatic runner.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Airbnb Developer                        │
│                   (runs `npm test`)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Jest Test Runner                         │
│  - Discovers test files in test/                            │
│  - Executes tests in parallel                               │
│  - Reports results                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Jest Test Suites (test/*.test.js)              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  graphql-security.test.js                            │  │
│  │  - Detects dangerous patterns                        │  │
│  │  - Validates introspection blocking                  │  │
│  │  - Checks depth attack detection                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  graphql-complexity.test.js                          │  │
│  │  - Estimates query complexity                        │  │
│  │  - Classifies by computational cost                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ runEval(evalPath)
                         │
┌────────────────────────▼────────────────────────────────────┐
│          @vibecheck/runner (npm package)                    │
│                                                              │
│  - Loads YAML evaluation definitions                        │
│  - Executes test cases against LLM                          │
│  - Grades responses using rubric                            │
│  - Returns structured results                               │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Reads eval definitions
                         │
┌────────────────────────▼────────────────────────────────────┐
│        Vibecheck Evaluation DSL (evals/*.yml)               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  graphql-security.yml                                │  │
│  │                                                       │  │
│  │  name: graphql-security-check                        │  │
│  │  model: claude-3-5-sonnet-20241022                   │  │
│  │  system_prompt: "Security expert instructions..."    │  │
│  │  test_cases:                                         │  │
│  │    - Safe queries (expected: SAFE)                   │  │
│  │    - Dangerous queries (expected: DANGEROUS)         │  │
│  │  grader: llm_rubric                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  graphql-complexity.yml                              │  │
│  │                                                       │  │
│  │  name: graphql-complexity-estimation                 │  │
│  │  model: claude-3-5-sonnet-20241022                   │  │
│  │  system_prompt: "Complexity analyzer instructions..." │  │
│  │  test_cases:                                         │  │
│  │    - Queries with expected complexity levels         │  │
│  │  grader: llm_rubric                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ API calls
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Anthropic API (Claude Models)                  │
│                                                              │
│  - Receives GraphQL query + instructions                    │
│  - Analyzes security implications                           │
│  - Returns classification & explanation                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Test Execution Flow

```
Developer runs `npm test`
    │
    ├──> Jest discovers test files
    │
    ├──> For each test file:
    │    │
    │    ├──> Test calls runEval(evalPath)
    │    │
    │    ├──> Vibecheck runner loads YAML
    │    │
    │    ├──> For each test case in YAML:
    │    │    │
    │    │    ├──> Send to Claude API
    │    │    ├──> Receive response
    │    │    ├──> Grade using rubric
    │    │    └──> Store result
    │    │
    │    ├──> Return aggregated results
    │    │
    │    └──> Jest assertions on results
    │
    └──> Jest reports final status
```

### 2. Evaluation Result Flow

```javascript
// Input: Evaluation file path
const evalPath = './evals/graphql-security.yml';

// Vibecheck processes
const results = await runEval(evalPath);

// Output structure:
{
  summary: {
    total_tests: 8,
    passed: 7,
    failed: 1,
    pass_rate: 87.5
  },
  test_results: [
    {
      input: "GraphQL query...",
      expected_output: "SAFE",
      output: "SAFE: Analysis...",
      grade: "PASS",
      score: 1.0
    },
    // ... more results
  ]
}

// Jest assertions
expect(results.summary.pass_rate).toBeGreaterThanOrEqual(90);
```

## Component Responsibilities

### Jest Layer (test/*.test.js)

**Responsibilities:**
- Discover and execute tests
- Call Vibecheck runner with eval paths
- Assert on results
- Provide developer-friendly output
- Handle test organization and filtering

**Key Files:**
- `test/graphql-security.test.js`
- `test/graphql-complexity.test.js`

### Vibecheck Runner (@vibecheck/runner)

**Responsibilities:**
- Parse YAML evaluation definitions
- Execute test cases against LLM
- Apply grading rubrics
- Aggregate results
- Handle API communication

**Package:** `@vibecheck/runner` (npm)

### Evaluation Definitions (evals/*.yml)

**Responsibilities:**
- Define what to test (test cases)
- Define how to test (system prompt)
- Define success criteria (grading rubric)
- Specify which model to use

**Format:** Vibecheck DSL (YAML)

### Test Data (test-data/*.graphql)

**Responsibilities:**
- Provide example queries
- Document safe patterns
- Document dangerous patterns
- Serve as reference for developers

**Format:** GraphQL

## Design Patterns

### Pattern 1: Separation of Concerns

```
┌─────────────────────────────────────────────┐
│  Test Orchestration (Jest)                 │ ← Developer-facing
├─────────────────────────────────────────────┤
│  Evaluation Logic (Vibecheck)              │ ← AI/LLM interaction
├─────────────────────────────────────────────┤
│  Domain Knowledge (YAML DSL)               │ ← Security rules
└─────────────────────────────────────────────┘
```

This separation allows:
- Security experts to modify rules without code changes
- Developers to work with familiar Jest syntax
- Vibecheck to handle LLM complexity

### Pattern 2: Declarative Evaluation

Instead of imperative code:

```javascript
// NOT THIS (imperative)
async function checkQuery(query) {
  const prompt = "Check if this is safe...";
  const response = await callLLM(prompt + query);
  const isSafe = response.includes("SAFE");
  return isSafe;
}
```

We use declarative YAML:

```yaml
# THIS (declarative)
test_cases:
  - input: |
      query GetUser { ... }
    expected_output: SAFE

grader:
  type: llm_rubric
  rubric: "Check for SAFE/DANGEROUS..."
```

Benefits:
- Non-programmers can modify tests
- Versioning is easier
- Pattern reuse across projects
- Less code maintenance

### Pattern 3: Programmatic Access

The key innovation:

```javascript
// OLD: CLI-based approach
// $ vibecheck run evals/security.yml
// (separate tool, harder to integrate)

// NEW: Programmatic approach
const results = await runEval('evals/security.yml');
// (native npm, integrates with existing tooling)
```

## Integration Points

### Development Workflow

```bash
# Developer workflow (all standard npm commands)
npm install              # Install Vibecheck runner + Jest
npm test                 # Run security evals
npm run test:watch       # Dev mode with auto-rerun
npm run test:coverage    # Coverage reports
```

### Production Monitoring

```javascript
// Regular production runs
setInterval(async () => {
  const results = await runEval('./evals/graphql-security.yml');

  if (results.summary.pass_rate < 85) {
    await sendAlert('Security eval degradation detected');
  }

  await logMetrics({
    pass_rate: results.summary.pass_rate,
    timestamp: Date.now()
  });
}, 3600000); // Every hour
```

## Scalability Considerations

### Parallel Execution

Jest runs tests in parallel by default:

```javascript
// These run concurrently
test('security eval', async () => { ... });
test('complexity eval', async () => { ... });
```

### Caching

For faster iterations:

```javascript
// Cache eval results during development
const cache = new Map();

async function runEvalCached(path) {
  if (cache.has(path)) return cache.get(path);
  const results = await runEval(path);
  cache.set(path, results);
  return results;
}
```

### Cost Management

Each test case = 1 LLM API call

```
8 test cases × 2 evaluations = 16 API calls per test run
Cost: ~$0.01-0.05 per run (with Claude Sonnet)
```

Optimization strategies:
- Cache results for unchanged evals
- Use faster models for development
- Use production models for critical checks

## Extension Points

### Adding New Evaluations

1. Create YAML file in `evals/`
2. Create Jest test in `test/`
3. Run `npm test`

### Custom Graders

Vibecheck supports multiple grader types:

```yaml
# LLM-based grading
grader:
  type: llm_rubric
  rubric: "Instructions for grading..."

# Exact match
grader:
  type: exact_match

# Contains
grader:
  type: contains
  expected: "SAFE"
```

### Custom Test Runners

```javascript
// Build your own on top of runEval
async function customRunner(evalPath, options) {
  const results = await runEval(evalPath);

  // Add custom processing
  await sendToDatadog(results);
  await updateDashboard(results);

  return results;
}
```

## Security Considerations

### API Key Management

```javascript
// GOOD: Environment variable
process.env.ANTHROPIC_API_KEY

// BAD: Hardcoded
const key = "sk-ant-..."; // NEVER DO THIS
```

### Result Validation

Always validate results before making security decisions:

```javascript
// Don't blindly trust LLM responses
const results = await runEval(path);

if (results.summary.pass_rate < THRESHOLD) {
  // Investigate before taking action
  await alertSecurityTeam(results);
} else {
  // Multiple confirmations for security decisions
  const confirmed = await secondaryCheck();
  if (confirmed) {
    applySecurityPolicy();
  }
}
```

## Performance Metrics

Typical execution times:

- Single test case: 1-3 seconds (LLM latency)
- Full security eval (8 cases): 10-20 seconds
- Full test suite (2 evals): 20-40 seconds
- Parallel execution: Can reduce by 50%+

## Future Enhancements

Potential improvements:

1. **Result Caching**: Cache LLM responses for identical queries
2. **Streaming Results**: Stream results as they complete
3. **Custom Models**: Support for different LLM providers
4. **Real-time Validation**: Integrate into GraphQL gateway
5. **Historical Tracking**: Track eval performance over time
6. **A/B Testing**: Compare different prompts/models

## Conclusion

This architecture demonstrates how Vibecheck's programmatic runner enables:

- **Seamless Integration**: Works with existing npm/Jest workflows
- **Developer Experience**: Familiar tooling and patterns
- **Flexibility**: Easy to extend and customize
- **Production Ready**: Suitable for automated testing and monitoring
- **Maintainability**: Declarative evals, programmatic testing
