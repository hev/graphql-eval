# Setup Complete - GraphQL Security Evaluation Suite

## Repository Status: READY FOR AIRBNB

This repository is now a complete, production-ready solution for GraphQL security evaluation using Vibecheck's programmatic runner.

## What Has Been Created

### Core Infrastructure
- [x] `package.json` - Dependencies including @vibecheck/runner and Jest
- [x] `jest.config.js` - Jest configuration optimized for LLM-based tests
- [x] `.gitignore` - Proper ignore patterns
- [x] `.env.example` - Environment variable template

### Evaluation Definitions (Vibecheck DSL)
- [x] `evals/graphql-security.yml` - Security vulnerability detection
  - Detects: introspection, deep nesting, batch attacks, missing pagination
  - 8 test cases covering safe and dangerous patterns
  
- [x] `evals/graphql-complexity.yml` - Query complexity estimation
  - Classifies queries: LOW, MEDIUM, HIGH, EXTREME
  - 4 test cases with different complexity levels

### Jest Test Suites
- [x] `test/graphql-security.test.js` - 6 comprehensive security tests
  - Overall pass rate validation
  - Pattern-specific detection tests
  - Output quality validation
  
- [x] `test/graphql-complexity.test.js` - 5 complexity estimation tests
  - Classification accuracy tests
  - Score extraction validation
  - Level differentiation tests

### Test Data
- [x] `test-data/safe-queries.graphql` - 5 examples of secure GraphQL queries
- [x] `test-data/dangerous-queries.graphql` - 8 examples of attack patterns

### Documentation
- [x] `README.md` - Comprehensive main documentation
  - Quick start guide
  - Feature comparison table
  - Integration examples
  - Troubleshooting guide
  
- [x] `QUICK_START.md` - 2-minute getting started guide
- [x] `USAGE_GUIDE.md` - Detailed usage patterns and examples
- [x] `ARCHITECTURE.md` - System architecture and design patterns
- [x] `CONTRIBUTING.md` - Guidelines for adding new evaluations

### Example Code
- [x] `examples/custom-query-check.js` - Real-time query validation example
- [x] `examples/advanced-integration.js` - Production integration patterns
  - Parallel execution
  - Result aggregation
  - Threshold alerting
  - Historical comparison

## File Structure

```
graphql-eval/
├── evals/
│   ├── graphql-security.yml         # Security eval definition
│   └── graphql-complexity.yml       # Complexity eval definition
├── examples/
│   ├── custom-query-check.js        # Real-time validation example
│   └── advanced-integration.js      # Production patterns
├── test/
│   ├── graphql-security.test.js     # Security test suite
│   └── graphql-complexity.test.js   # Complexity test suite
├── test-data/
│   ├── safe-queries.graphql         # Safe query examples
│   └── dangerous-queries.graphql    # Attack pattern examples
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore patterns
├── ARCHITECTURE.md                  # Architecture documentation
├── CONTRIBUTING.md                  # Contribution guidelines
├── jest.config.js                   # Jest configuration
├── package.json                     # Dependencies and scripts
├── QUICK_START.md                   # Quick start guide
├── README.md                        # Main documentation
└── USAGE_GUIDE.md                   # Detailed usage guide
```

## Key Features Implemented

### 1. Programmatic Access via npm
- Uses `@vibecheck/runner` package
- No CLI dependencies required
- Native npm/Jest integration
- Familiar developer experience

### 2. Production-Ready Testing
- Comprehensive Jest test suites
- Parallel test execution
- Configurable timeouts
- Clear assertion messages
- Coverage support

### 3. Security Pattern Detection
- Schema introspection blocking
- Deep nesting detection
- Batch/alias attack detection
- Missing pagination detection
- Circular query detection
- Type introspection blocking

### 4. Query Complexity Analysis
- Numeric complexity scoring
- Multi-level classification
- Cost estimation
- Rate limiting guidance

### 5. Developer Experience
- Standard npm commands (`npm test`, `npm run test:watch`)
- Watch mode for development
- Verbose output options
- Coverage reporting
- Clear error messages

### 6. Documentation
- Quick start (2 minutes)
- Comprehensive README
- Usage examples
- Architecture diagrams
- Contribution guidelines

### 7. Production Ready
- Comprehensive examples
- Error handling
- Best practices
- Scheduled runs

## How to Use (3 Commands)

```bash
# 1. Clone the repository
git clone <repository-url>
cd graphql-eval

# 2. Install dependencies
npm install

# 3. Run evaluations
npm test
```

## Expected Output

```
PASS  test/graphql-security.test.js
  GraphQL Security Evaluation
    ✓ should run security evaluation and pass all test cases (2500ms)
    ✓ should detect dangerous introspection queries (2100ms)
    ✓ should detect deep nesting attacks (2000ms)
    ✓ should detect batch/alias attacks (1900ms)
    ✓ should allow safe queries (2200ms)
    ✓ should provide detailed security analysis (2000ms)

PASS  test/graphql-complexity.test.js
  GraphQL Complexity Evaluation
    ✓ should run complexity evaluation and pass all test cases (2300ms)
    ✓ should classify simple queries as LOW complexity (2100ms)
    ✓ should classify introspection queries as EXTREME complexity (2000ms)
    ✓ should provide numeric complexity scores (1950ms)
    ✓ should differentiate between complexity levels (2050ms)

Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        24.1 s
```

## Prerequisites for your organization Team

1. **Node.js 18+** installed
2. **Anthropic API Key** from https://console.anthropic.com/
3. **Git** for cloning the repository

## Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API key
VIBECHECK_API_KEY=your-key-here
```

## Available npm Scripts

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode (auto-rerun on changes)
npm run test:coverage # Run with coverage reporting
npm run test:verbose  # Verbose output
```

## Integration Options

### Option 1: Standard Testing (Recommended)
Run as part of your regular test suite:
```bash
npm test
```

### Option 2: Programmatic Integration
Use the runner directly in your code:
```javascript
const { runEval } = require('@vibecheck/runner');
const results = await runEval('./evals/graphql-security.yml');
```

### Option 4: Real-time Validation
Integrate into GraphQL gateway (see `examples/custom-query-check.js`)

## Customization Guide

### Add New Test Cases
Edit `evals/graphql-security.yml`:
```yaml
test_cases:
  - input: |
      query YourQuery { ... }
    expected_output: SAFE
```

### Adjust Pass Rate Thresholds
Edit test files:
```javascript
expect(passRate).toBeGreaterThanOrEqual(90); // Change 90 to your threshold
```

### Add New Evaluations
1. Create `evals/your-eval.yml`
2. Create `test/your-eval.test.js`
3. Run `npm test`

## Performance Characteristics

- **Single test case**: 1-3 seconds (LLM API latency)
- **Full security eval**: 10-20 seconds (8 test cases)
- **Complete test suite**: 20-40 seconds (both evals)
- **Cost per run**: ~$0.01-0.05 (using Claude Sonnet)

## Next Steps for your organization

1. **Clone and Test**
   - Clone the repository
   - Run `npm install`
   - Run `npm test` to verify everything works

2. **Review Evaluations**
   - Check `evals/graphql-security.yml` for security patterns
   - Review `test-data/dangerous-queries.graphql` for attack examples
   - Validate that patterns match your security concerns

3. **Customize for Your Schema**
   - Add test cases specific to your GraphQL schema
   - Include your actual field names and relationships
   - Test against real queries from your production logs

4. **Integrate into your workflow**
   - Add to your test suite
   - Configure pass rate thresholds
   - Monitor results

5. **Monitor in Production**
   - Use `examples/advanced-integration.js` for inspiration
   - Set up alerting for pass rate degradation
   - Track metrics over time

## Support and Resources

- **Vibecheck Documentation**: https://github.com/hev/vibecheck
- **This Repository**: All documentation in this repo
- **GraphQL Security**: OWASP GraphQL Cheat Sheet

## What Makes This Special

This is the FIRST example of using Vibecheck's programmatic runner for GraphQL security. It showcases:

1. **No CLI Required**: Everything through npm/Jest
2. **Production Ready**: Real-world patterns and best practices
3. **Developer Friendly**: Familiar tooling and workflows
4. **Extensible**: Easy to add new evaluations
5. **Documented**: Comprehensive guides and examples

## Success Criteria

✅ Repository is cloneable
✅ `npm install` works
✅ `npm test` executes evaluations
✅ Tests pass with reasonable pass rates
✅ Documentation is clear and comprehensive
✅ Examples demonstrate real-world usage
✅ Customization is easy

## Final Notes

This repository is ready for immediate use by your organization engineering teams. The setup is:

- **Turnkey**: Clone, install, test
- **Standard**: Uses familiar npm/Jest workflows
- **Documented**: Multiple guides for different needs
- **Extensible**: Easy to customize and extend
- **Production-Ready**: Includes monitoring and integration examples

---

**Repository Status**: ✅ READY FOR PRODUCTION USE

**Last Updated**: 2025-11-14

**Vibecheck Feature**: Programmatic Runner via @vibecheck/runner npm package
