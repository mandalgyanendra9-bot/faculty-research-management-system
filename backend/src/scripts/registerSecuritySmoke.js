/* eslint-disable no-console */
const API_BASE = process.env.QA_API_BASE || "http://localhost:5000/api";

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
  const runId = Date.now();
  const superAdminEmail = process.env.SMOKE_SUPER_ADMIN_EMAIL || "mandalgyanendra9@gmail.com";
  const superAdminPassword = process.env.SMOKE_SUPER_ADMIN_PASSWORD || "Admin@123";

  const publicRoleAssign = await request("/auth/register", "POST", "", {
    name: "Role Escalation Attempt",
    email: `role-escalation-${runId}@frms.com`,
    password: "Faculty@123",
    role: "super_admin",
  });

  if (publicRoleAssign.status !== 403) {
    failures += 1;
    console.error(`FAIL public role self-assignment => ${publicRoleAssign.status} (expected 403)`);
  } else {
    console.log("PASS public role self-assignment blocked");
  }

  const publicRegisterEmail = `pending-faculty-${runId}@frms.com`;
  const publicRegister = await request("/auth/register", "POST", "", {
    name: "Pending Faculty User",
    email: publicRegisterEmail,
    password: "Faculty@123",
  });

  const publicRegisterPass =
    publicRegister.status === 201
    && publicRegister.payload?.data?.user?.role === "faculty"
    && publicRegister.payload?.data?.user?.isActive === false
    && !publicRegister.payload?.data?.token;

  if (!publicRegisterPass) {
    failures += 1;
    console.error(
      `FAIL public register defaults => ${publicRegister.status} payload=${JSON.stringify(publicRegister.payload)}`
    );
  } else {
    console.log("PASS public register defaults to inactive faculty");
  }

  const pendingLogin = await request("/auth/login", "POST", "", {
    email: publicRegisterEmail,
    password: "Faculty@123",
  });

  if (pendingLogin.status !== 403) {
    failures += 1;
    console.error(`FAIL inactive faculty login => ${pendingLogin.status} (expected 403)`);
  } else {
    console.log("PASS inactive faculty login blocked");
  }

  const superAdminToken = await login(superAdminEmail, superAdminPassword);
  const privilegedCreate = await request("/auth/register", "POST", superAdminToken, {
    name: "Admin Created HOD",
    email: `hod-created-${runId}@frms.com`,
    password: "Hod@12345",
    role: "hod_dean",
  });

  const privilegedPass =
    privilegedCreate.status === 201
    && privilegedCreate.payload?.data?.user?.role === "hod_dean"
    && privilegedCreate.payload?.data?.user?.isActive === true
    && !!privilegedCreate.payload?.data?.token;

  if (!privilegedPass) {
    failures += 1;
    console.error(
      `FAIL privileged role creation => ${privilegedCreate.status} payload=${JSON.stringify(privilegedCreate.payload)}`
    );
  } else {
    console.log("PASS super_admin can create privileged users");
  }

  if (failures) {
    console.error(`Register security smoke failed with ${failures} issue(s).`);
    process.exit(1);
  }

  console.log("Register security smoke passed.");
})();
