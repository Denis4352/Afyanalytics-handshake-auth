require("dotenv").config();
const https = require("https");

console.log("🚀 App starting...\n");

// ================== CONFIG ==================
const BASE_URL = "staging.collabmed.net";

const PLATFORM_NAME = process.env.PLATFORM_NAME;
const PLATFORM_KEY = process.env.PLATFORM_KEY;
const PLATFORM_SECRET = process.env.PLATFORM_SECRET;
const CALLBACK_URL =
  process.env.CALLBACK_URL || "https://your-platform.com/callback";

// ================== LOGGER ==================
function logStep(title, obj) {
  console.log(`\n➡️ ${title}`);
  console.log(JSON.stringify(obj, null, 2));
}

function logResponse(title, res) {
  const short = {
    success: res?.success,
    message: res?.message,
    handshake_token: res?.data?.handshake_token,
    access_token: res?.data?.access_token ? "***RECEIVED***" : undefined,
  };

  console.log(`\n⬅️ ${title}`);
  console.log(JSON.stringify(short, null, 2));
}

// ================== REQUEST FUNCTION ==================
function postRequest(endpoint, payload, stepName) {
  logStep(`SEND → ${stepName}`, payload);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: BASE_URL,
        path: `/api/external${endpoint}`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            logResponse(`RESPONSE ← ${stepName}`, json);
            resolve(json);
          } catch (err) {
            console.log("❌ Raw response:", data);
            reject(err);
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

// ================== MAIN FLOW ==================
async function runHandshake() {
  try {
    console.log("🔐 Step 1: Initiating handshake...\n");

    const initResponse = await postRequest(
      "/initiate-handshake",
      {
        platform_name: PLATFORM_NAME,
        platform_key: PLATFORM_KEY,
        platform_secret: PLATFORM_SECRET,
        callback_url: CALLBACK_URL,
      },
      "INITIATE HANDSHAKE"
    );

    if (!initResponse.success) {
      throw new Error("Initiate handshake failed");
    }

    const handshakeToken = initResponse.data.handshake_token;

    console.log("\n✔ Handshake token received");

    console.log("\n🔄 Step 2: Completing handshake...\n");

    const completeResponse = await postRequest(
      "/complete-handshake",
      {
        handshake_token: handshakeToken,
        platform_key: PLATFORM_KEY,
      },
      "COMPLETE HANDSHAKE"
    );

    if (!completeResponse.success) {
      throw new Error("Complete handshake failed");
    }

    // ================== FINAL OUTPUT ==================
    console.log("\n🎉 DONE SUCCESSFULLY\n");

    console.log("🔑 Access Token:");
    console.log(completeResponse.data.access_token);

    console.log("\n🔁 Refresh Token:");
    console.log(completeResponse.data.refresh_token);

    console.log("\n✅ Flow completed\n");
  } catch (err) {
    console.error("\n❌ ERROR:", err.message);
  }
}

// ================== RUN ==================
runHandshake();