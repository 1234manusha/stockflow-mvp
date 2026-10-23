
const autocannon = require("autocannon");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const TOKEN = process.env.PERF_TEST_TOKEN;

async function runTest(name, options) {
  console.log(`\nStarting: ${name}`);

  const result = await new Promise((resolve, reject) => {
    autocannon(
      {
        ...options,
        connections: 10,
        duration: 20,
        workers: 1
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });

  console.log(`\nResults: ${name}`);
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Throughput/sec: ${result.throughput.average} bytes`);
  console.log(`Latency average: ${result.latency.average} ms`);
  console.log(`Latency p50: ${result.latency.p50} ms`);
  console.log(`Latency p97: ${result.latency.p97} ms`);
  console.log(`Latency p99: ${result.latency.p99} ms`);
  console.log(`2xx responses: ${result['2xx']}`);
  console.log(`Non-2xx responses: ${result.non2xx}`);
  console.log(`Errors: ${result.errors}`);
  console.log(`Timeouts: ${result.timeouts}`);

  return result;
}

async function main() {
  try {
    await runTest("Health endpoint", {
      url: `${BASE_URL}/api/health`
    });

    if (TOKEN) {
      await runTest("Authenticated products API", {
        url: `${BASE_URL}/api/products`,
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });
    } else {
      console.log(
        "\nProducts test skipped: set PERF_TEST_TOKEN to a valid test-account JWT."
      );
    }
  } catch (error) {
    console.error("Performance test failed:", error.message);
    process.exitCode = 1;
  }
}

main();
