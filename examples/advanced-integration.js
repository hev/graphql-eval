/**
 * Advanced Integration Example
 *
 * This example demonstrates advanced patterns for integrating Vibecheck
 * evaluations into production systems:
 *
 * 1. Running multiple evaluations in parallel
 * 2. Custom result processing and reporting
 * 3. Integration with monitoring systems
 * 4. Threshold-based alerting
 * 5. Caching and optimization
 */

const { runEval } = require('@vibecheck/runner');
const path = require('path');

/**
 * Run multiple evaluations in parallel and aggregate results
 */
async function runAllEvaluations() {
  const evaluations = [
    path.join(__dirname, '../evals/graphql-security.yml'),
    path.join(__dirname, '../evals/graphql-complexity.yml')
  ];

  console.log('Running all evaluations in parallel...\n');

  const startTime = Date.now();

  // Run all evaluations concurrently
  const results = await Promise.all(
    evaluations.map(async (evalPath) => {
      const evalName = path.basename(evalPath, '.yml');
      console.log(`Starting: ${evalName}`);

      try {
        const result = await runEval(evalPath);
        console.log(`Completed: ${evalName} (${result.summary.pass_rate}% pass rate)`);
        return { name: evalName, success: true, result };
      } catch (error) {
        console.error(`Failed: ${evalName}`, error.message);
        return { name: evalName, success: false, error };
      }
    })
  );

  const duration = Date.now() - startTime;

  return {
    results,
    duration,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate a detailed report from evaluation results
 */
function generateReport(aggregatedResults) {
  const { results, duration, timestamp } = aggregatedResults;

  const report = {
    timestamp,
    duration_ms: duration,
    summary: {
      total_evaluations: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    },
    evaluations: results.map(r => {
      if (!r.success) {
        return {
          name: r.name,
          status: 'FAILED',
          error: r.error.message
        };
      }

      const { result } = r;
      return {
        name: r.name,
        status: 'SUCCESS',
        pass_rate: result.summary.pass_rate,
        total_tests: result.summary.total_tests,
        passed: result.summary.passed,
        failed: result.summary.failed,
        failures: result.test_results
          .filter(test => test.grade === 'FAIL')
          .map(test => ({
            input: test.input.substring(0, 100) + '...',
            expected: test.expected_output,
            actual: test.output.substring(0, 100) + '...',
            score: test.score
          }))
      };
    })
  };

  return report;
}

/**
 * Check if results meet quality thresholds
 */
function checkThresholds(report) {
  const thresholds = {
    min_pass_rate: 85,
    max_failures_allowed: 2
  };

  const alerts = [];

  report.evaluations.forEach(eval_ => {
    if (eval_.status === 'FAILED') {
      alerts.push({
        severity: 'HIGH',
        message: `Evaluation ${eval_.name} failed to run: ${eval_.error}`
      });
      return;
    }

    if (eval_.pass_rate < thresholds.min_pass_rate) {
      alerts.push({
        severity: 'MEDIUM',
        message: `Evaluation ${eval_.name} has low pass rate: ${eval_.pass_rate}% (threshold: ${thresholds.min_pass_rate}%)`
      });
    }

    if (eval_.failed > thresholds.max_failures_allowed) {
      alerts.push({
        severity: 'LOW',
        message: `Evaluation ${eval_.name} has ${eval_.failed} failures (threshold: ${thresholds.max_failures_allowed})`
      });
    }
  });

  return alerts;
}

/**
 * Send alerts to monitoring system (example)
 */
function sendAlerts(alerts) {
  if (alerts.length === 0) {
    console.log('\nNo alerts - all evaluations passed thresholds');
    return;
  }

  console.log('\nALERTS:');
  alerts.forEach(alert => {
    console.log(`[${alert.severity}] ${alert.message}`);

    // In production, send to your monitoring system:
    // - Datadog
    // - PagerDuty
    // - Slack
    // - Email
    // etc.
  });
}

/**
 * Save results for historical tracking
 */
function saveResults(report) {
  const fs = require('fs');
  const resultsDir = path.join(__dirname, '../results');

  // Create results directory if it doesn't exist
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Save with timestamp
  const filename = `eval-results-${report.timestamp.replace(/:/g, '-')}.json`;
  const filepath = path.join(resultsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`\nResults saved to: ${filepath}`);

  // Also save as latest
  const latestPath = path.join(resultsDir, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
}

/**
 * Compare with previous results to detect degradation
 */
function compareWithPrevious(currentReport) {
  const fs = require('fs');
  const latestPath = path.join(__dirname, '../results/latest.json');

  if (!fs.existsSync(latestPath)) {
    console.log('\nNo previous results to compare');
    return [];
  }

  const previousReport = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
  const degradations = [];

  currentReport.evaluations.forEach(current => {
    const previous = previousReport.evaluations.find(e => e.name === current.name);

    if (!previous) return;

    if (current.status === 'SUCCESS' && previous.status === 'SUCCESS') {
      const passRateDiff = current.pass_rate - previous.pass_rate;

      if (passRateDiff < -5) {
        degradations.push({
          evaluation: current.name,
          message: `Pass rate dropped by ${Math.abs(passRateDiff).toFixed(1)}% (${previous.pass_rate}% → ${current.pass_rate}%)`,
          severity: passRateDiff < -10 ? 'HIGH' : 'MEDIUM'
        });
      }
    }
  });

  return degradations;
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(70));
  console.log('Advanced Vibecheck Integration Example');
  console.log('='.repeat(70));

  // 1. Run all evaluations
  const aggregatedResults = await runAllEvaluations();

  // 2. Generate report
  const report = generateReport(aggregatedResults);

  // 3. Display summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Duration: ${report.duration_ms}ms`);
  console.log(`Evaluations: ${report.summary.successful}/${report.summary.total_evaluations} successful`);

  report.evaluations.forEach(eval_ => {
    if (eval_.status === 'SUCCESS') {
      console.log(`  ${eval_.name}: ${eval_.pass_rate}% (${eval_.passed}/${eval_.total_tests} passed)`);
    } else {
      console.log(`  ${eval_.name}: FAILED`);
    }
  });

  // 4. Check thresholds and send alerts
  const alerts = checkThresholds(report);
  sendAlerts(alerts);

  // 5. Compare with previous run
  const degradations = compareWithPrevious(report);
  if (degradations.length > 0) {
    console.log('\nDEGRADATIONS DETECTED:');
    degradations.forEach(deg => {
      console.log(`[${deg.severity}] ${deg.evaluation}: ${deg.message}`);
    });
  }

  // 6. Save results
  saveResults(report);

  // 7. Exit with appropriate code
  const hasFailures = report.summary.failed > 0 || alerts.length > 0;
  process.exit(hasFailures ? 1 : 0);
}

// Export for use in other scripts
module.exports = {
  runAllEvaluations,
  generateReport,
  checkThresholds,
  sendAlerts,
  saveResults,
  compareWithPrevious
};

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
