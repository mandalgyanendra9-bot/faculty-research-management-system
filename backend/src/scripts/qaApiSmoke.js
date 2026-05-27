/* eslint-disable no-console */
const API_BASE = process.env.QA_API_BASE || "http://localhost:5000/api";

const roleUsers = {
  super_admin: { email: "admin@frms.com", password: "Admin@123" },
  admin: { email: "admin.user@frms.com", password: "AdminUser@123" },
  hod_dean: { email: "hod.cse@frms.com", password: "Hod@12345" },
  research_coordinator: { email: "coordinator@frms.com", password: "Coord@123" },
  faculty: { email: "faculty1@frms.com", password: "Faculty@123" },
};

const roleMatrix = {
  super_admin: [
    ["/dashboard/overview", 200],
    ["/faculty/me", 404],
    ["/publications", 200],
    ["/projects", 200],
    ["/patents", 200],
    ["/grants", 200],
    ["/events", 200],
    ["/approvals/pending", 200],
    ["/reports", 200],
    ["/ai/publication-recommendation", 200, "POST", { researchArea: "AI healthcare" }],
    ["/settings/ai-provider", 200],
    ["/notifications", 200],
    ["/audit-logs", 200],
  ],
  admin: [
    ["/dashboard/overview", 200],
    ["/faculty/me", 404],
    ["/publications", 200],
    ["/projects", 200],
    ["/patents", 200],
    ["/grants", 200],
    ["/events", 200],
    ["/approvals/pending", 200],
    ["/reports", 200],
    ["/ai/publication-recommendation", 200, "POST", { researchArea: "IoT" }],
    ["/settings/ai-provider", 200],
    ["/notifications", 200],
    ["/audit-logs", 200],
  ],
  hod_dean: [
    ["/dashboard/overview", 200],
    ["/faculty/me", 404],
    ["/publications", 200],
    ["/projects", 200],
    ["/patents", 200],
    ["/grants", 200],
    ["/events", 200],
    ["/approvals/pending", 200],
    ["/reports", 200],
    ["/ai/publication-recommendation", 200, "POST", { researchArea: "signal processing" }],
    ["/settings/ai-provider", 403],
    ["/notifications", 200],
    ["/audit-logs", 403],
  ],
  research_coordinator: [
    ["/dashboard/overview", 200],
    ["/faculty/me", 404],
    ["/publications", 200],
    ["/projects", 200],
    ["/patents", 200],
    ["/grants", 200],
    ["/events", 200],
    ["/approvals/pending", 200],
    ["/reports", 200],
    ["/ai/publication-recommendation", 200, "POST", { researchArea: "big data" }],
    ["/settings/ai-provider", 200],
    ["/notifications", 200],
    ["/audit-logs", 403],
  ],
  faculty: [
    ["/dashboard/overview", 200],
    ["/faculty/me", 200],
    ["/publications", 200],
    ["/projects", 200],
    ["/patents", 200],
    ["/grants", 200],
    ["/events", 200],
    ["/approvals/pending", 403],
    ["/reports", 200],
    ["/ai/publication-recommendation", 200, "POST", { researchArea: "machine learning" }],
    ["/settings/ai-provider", 403],
    ["/notifications", 200],
    ["/audit-logs", 403],
  ],
};

const request = async (path, method = "GET", token = "", body) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    payload = null;
  }

  return { status: response.status, payload };
};

const login = async (email, password) => {
  const res = await request("/auth/login", "POST", "", { email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.payload)}`);
  }
  return res.payload?.data?.token;
};

(async () => {
  let failures = 0;

  for (const [role, creds] of Object.entries(roleUsers)) {
    try {
      const token = await login(creds.email, creds.password);
      console.log(`\\n[${role}] login ok`);

      for (const [path, expected, method = "GET", body] of roleMatrix[role]) {
        const res = await request(path, method, token, body);
        const pass = res.status === expected;
        if (!pass) failures += 1;
        console.log(`${pass ? "PASS" : "FAIL"} ${method} ${path} => ${res.status} (expected ${expected})`);
      }
    } catch (error) {
      failures += 1;
      console.error(`[${role}] fatal: ${error.message}`);
    }
  }

  if (failures) {
    console.error(`\\nQA finished with ${failures} failure(s).`);
    process.exit(1);
  }

  console.log("\\nQA role/module smoke test passed.");
})();
