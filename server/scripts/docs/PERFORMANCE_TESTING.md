# StockFlow Performance Testing Report

## 1. Objective

The objective of performance testing is to evaluate StockFlow's backend response time, request-handling capacity, and reliability under concurrent HTTP requests.

## 2. Testing Environment

- Application: StockFlow Inventory Management System
- Backend: Node.js and Express
- Database: MySQL
- Testing tool: Autocannon
- Environment: Local development server
- Backend URL: `http://localhost:5000`

## 3. Test Configuration

- Concurrent connections: 10
- Test duration: 20 seconds per endpoint
- Health endpoint: `GET /api/health`
- Products endpoint: `GET /api/products`
- Authentication: A valid JWT is required for the products endpoint.

## 4. Test Scenarios

### Test Case 1: Health Endpoint

**Purpose:** Measure basic API responsiveness.

**Endpoint:** `GET /api/health`

**Metrics:** Requests per second, average latency, p50 latency, p97 latency, p99 latency, non-2xx responses, errors, and timeouts.

### Test Case 2: Products API

**Purpose:** Evaluate an authenticated endpoint that retrieves products from the database.

**Endpoint:** `GET /api/products`

**Precondition:** The request must include a valid JWT from a test account.

**Metrics:** Requests per second, response latency, non-2xx responses, errors, and timeouts.

### Test Case 3: Error Handling

Verify that unauthenticated requests are rejected with HTTP 401 and that invalid product requests return the appropriate error response.

This is a functional check, not a complete load test of error scenarios.

## 5. Performance Results

Populate the following table with the actual Autocannon output.

| Metric | Health API | Products API |
|---|---|---|
| Requests per second | Pending | Pending |
| Average latency (ms) | Pending | Pending |
| p50 latency (ms) | Pending | Pending |
| p97 latency (ms) | Pending | Pending |
| p99 latency (ms) | Pending | Pending |
| Non-2xx responses | Pending | Pending |
| Errors and timeouts | Pending | Pending |

## 6. Analysis

Compare the results of the health and products endpoints. The products endpoint includes authentication and database access, so its response time may differ from the health endpoint.

Review latency percentiles, request throughput, and error counts to identify possible bottlenecks.

No performance pass/fail conclusion should be recorded until actual results have been reviewed.

The corrected health endpoint benchmark completed with 202,012 successful 2xx responses, no non-2xx responses, no reported errors, and no timeouts. Average latency was 0.34 ms, with p99 latency of 5 ms. These measurements were collected in a local development environment and should not be interpreted as production capacity guarantees.

## 7. Limitations

The initial benchmark uses 10 concurrent connections for 20 seconds. It does not establish the application's maximum capacity or guarantee production performance.

Results may vary depending on hardware, database size, system load, network conditions, and deployment configuration.

## 8. Conclusion

**Testing status:** Documentation and test procedure prepared. Actual benchmark measurements must be recorded before final evaluation.

Update this report after testing with the measured results, observations, and any optimizations performed.