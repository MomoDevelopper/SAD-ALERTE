import fs from "node:fs/promises";
import path from "node:path";

const API_BASE = "http://localhost:4000/api";
const EMAIL = process.argv[2];
const PASSWORD = process.argv[3];

if (!EMAIL || !PASSWORD) {
  throw new Error("Usage: node e2e-smoke.mjs <email> <password>");
}

async function main() {
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.accessToken) {
    throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginData)}`);
  }
  const token = loginData.accessToken;

  const incidentRes = await fetch(`${API_BASE}/incidents`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: (() => {
      const fd = new FormData();
      fd.append("type", "Test E2E");
      fd.append("description", "Incident test automatisé E2E");
      fd.append("locationMethod", "0");
      fd.append("region", "Sahel");
      fd.append("province", "Soum");
      fd.append("commune", "Djibo");
      return fd;
    })(),
  });
  const incidentData = await incidentRes.json();
  if (!incidentRes.ok) {
    throw new Error(`Incident create failed: ${incidentRes.status} ${JSON.stringify(incidentData)}`);
  }

  const pdfPath = path.join(process.cwd(), "uploads", "e2e-test.pdf");
  await fs.writeFile(pdfPath, "%PDF-1.1\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n", "utf8");
  const fileBuffer = await fs.readFile(pdfPath);
  const fileBlob = new Blob([fileBuffer], { type: "application/pdf" });

  const uploadFd = new FormData();
  uploadFd.append("file", fileBlob, "e2e-test.pdf");
  uploadFd.append("titre", "E2E Document");
  uploadFd.append("categorie", "rapport_incident");

  const uploadRes = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: uploadFd,
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(`Document upload failed: ${uploadRes.status} ${JSON.stringify(uploadData)}`);
  }

  const incidentsRes = await fetch(`${API_BASE}/incidents`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const incidentsData = await incidentsRes.json();
  if (!incidentsRes.ok) {
    throw new Error(`Incident list failed: ${incidentsRes.status} ${JSON.stringify(incidentsData)}`);
  }

  console.log(
    JSON.stringify({
      login: "ok",
      incidentCreate: incidentData,
      documentUpload: uploadData,
      incidentsCount: Array.isArray(incidentsData.incidents) ? incidentsData.incidents.length : -1,
    })
  );
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
