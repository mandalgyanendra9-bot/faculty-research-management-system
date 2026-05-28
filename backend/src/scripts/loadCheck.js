/* eslint-disable no-console */
const API_BASE = process.env.QA_API_BASE || "http://localhost:5000/api";
const TOTAL_REQUESTS = Number(process.env.LOAD_TOTAL_REQUESTS || 120);
const CONCURRENCY = Number(process.env.LOAD_CONCURRENCY || 12);

const requestOnce = async () => {
  const startedAt = Date.now();
  try {
    const response = await fetch(`${API_BASE}/health`);
    return {
      ok: response.ok,
      status: response.status,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      durationMs: Date.now() - startedAt,
      error: error.message,
    };
  }
};

const percentile = (arr, p) => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
};

const run = async () => {
  const queue = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i);
  const results = [];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      queue.pop();
      results.push(await requestOnce());
    }
  });

  const startedAt = Date.now();
  await Promise.all(workers);
  const elapsedMs = Date.now() - startedAt;

  const successes = results.filter((r) => r.ok).length;
  const failures = results.length - successes;
  const latencies = results.map((r) => r.durationMs);
  const avgLatency = latencies.reduce((sum, x) => sum + x, 0) / Math.max(1, latencies.length);

  const summary = {
    apiBase: API_BASE,
    totalRequests: TOTAL_REQUESTS,
    concurrency: CONCURRENCY,
    elapsedMs,
    requestsPerSecond: Number((TOTAL_REQUESTS / Math.max(1, elapsedMs / 1000)).toFixed(2)),
    successes,
    failures,
    averageLatencyMs: Number(avgLatency.toFixed(2)),
    p95LatencyMs: percentile(latencies, 95),
  };

  console.log("Load check summary:", summary);

  if (failures > 0) {
    process.exit(1);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
