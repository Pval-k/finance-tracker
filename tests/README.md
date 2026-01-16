# Testing & Metrics

This folder contains testing scripts and resume preparation materials.

## Test Scripts

### test-performance.js

Performance testing script for MongoDB database operations. Tests INSERT, READ, date range queries, and aggregation performance.

**Usage:**

```bash
cd backend && node ../tests/test-performance.js
```

**What it does:**

- Inserts 1000 test transactions
- Measures INSERT and READ performance
- Tests date range queries
- Tests aggregation pipelines
- Generates performance metrics for resume

### test-api-reliability.js

API endpoint testing script. Tests API reliability and success rates.

**Usage:**

```bash
node tests/test-api-reliability.js
```

**Note:** Requires Firebase emulator to be running and valid authentication tokens for full testing.

## Resume Materials

### RESUME_BULLETS.md

Ready-to-use bullet points for your resume, organized by category with keywords and interview talking points.

### RESUME_METRICS.md

Detailed breakdown of quantifiable metrics and achievements, including:

- API reliability improvements
- Database performance metrics
- Code quality metrics
- Feature implementation counts

## Notes

These files are for personal use and resume preparation. The test scripts generate real performance metrics based on your database configuration.
