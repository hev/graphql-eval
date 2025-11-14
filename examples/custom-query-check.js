/**
 * Example: Custom GraphQL Query Security Check
 *
 * This example shows how to use Vibecheck programmatically to check
 * a GraphQL query for security issues without running the full test suite.
 *
 * Use case: Integrate this into your GraphQL gateway or middleware to
 * perform real-time security checks on incoming queries.
 */

const { runEval } = require('@vibecheck/runner');
const path = require('path');

/**
 * Check if a GraphQL query is safe or dangerous
 * @param {string} query - The GraphQL query to analyze
 * @returns {Promise<{safe: boolean, analysis: string, confidence: number}>}
 */
async function checkQuerySecurity(query) {
  // Path to the security evaluation
  const evalPath = path.join(__dirname, '../evals/graphql-security.yml');

  // Create a temporary eval with just this query
  // Note: In a real implementation, you might want to create a
  // dedicated single-query eval file

  // For this example, we'll run the full eval and find our query
  // In production, you'd modify this to be more efficient

  console.log('Analyzing query security...');
  console.log('Query:', query);

  // Run the evaluation
  const results = await runEval(evalPath);

  // In a real implementation, you'd:
  // 1. Create a custom eval on-the-fly with just this query
  // 2. Run it through Vibecheck
  // 3. Parse the results

  // For demonstration, we'll check if the query matches any patterns
  const isDangerous = query.includes('__schema') ||
                      query.includes('__type') ||
                      (query.match(/\{/g) || []).length > 10;

  return {
    safe: !isDangerous,
    analysis: isDangerous
      ? 'Query contains potentially dangerous patterns'
      : 'Query appears safe',
    confidence: 0.85
  };
}

/**
 * Example usage in a GraphQL middleware context
 */
async function graphqlMiddleware(req, res, next) {
  const query = req.body.query;

  try {
    const securityCheck = await checkQuerySecurity(query);

    if (!securityCheck.safe) {
      console.warn('SECURITY WARNING: Dangerous query detected');
      console.warn('Analysis:', securityCheck.analysis);

      // Option 1: Reject the query
      // return res.status(403).json({
      //   error: 'Query blocked for security reasons',
      //   details: securityCheck.analysis
      // });

      // Option 2: Log and allow (for monitoring)
      console.log('Allowing query but logging for review');
    }

    next();
  } catch (error) {
    console.error('Security check failed:', error);
    // Decide: fail open or fail closed?
    next(); // Fail open - allow the query but log the error
  }
}

// Example standalone usage
async function main() {
  const exampleQueries = [
    // Safe query
    `query GetUser {
      user(id: "123") {
        name
        email
      }
    }`,

    // Dangerous query
    `query Introspection {
      __schema {
        types {
          name
        }
      }
    }`
  ];

  for (const query of exampleQueries) {
    console.log('\n' + '='.repeat(60));
    const result = await checkQuerySecurity(query);
    console.log('Safe:', result.safe);
    console.log('Analysis:', result.analysis);
    console.log('Confidence:', result.confidence);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkQuerySecurity, graphqlMiddleware };
