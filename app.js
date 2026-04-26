require("dotenv").config();
const https = require("https");

console.log("🚀 App starting...\n");

// ================== CONFIG ==================
const BASE_URL = "https://staging.collabmed.net";

const PLATFORM_NAME = process.env.PLATFORM_NAME;
const PLATFORM_KEY = process.env.PLATFORM_KEY;
const PLATFORM_SECRET = process.env.PLATFORM_SECRET;
const CALLBACK_URL =
  process.env.CALLBACK_URL || "https://your-platform.com/callback";

// ================== LOGGER ==================
function logStep(title, obj) {
  console.log(`\n➡️ ${title}`);
  console.log("📤 REQUEST:");
  console.log(JSON.stringify(obj, null, 2));
}

function logResponse(title, res) {
  console.log(`\n⬅️ ${title}`);
  console.log("📥 RESPONSE:");
  console.log(JSON.stringify(res, null, 2)); // ✅ NO MASKING
}

// ================== REQUEST FUNCTION ==================
function postRequest(endpoint, payload, stepName) {
  logStep(`SEND → ${stepName}`, payload);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: BASE_URL.replace("https://", ""),
        path: `/api/external${endpoint}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
            console.log("❌ Raw response:");
            console.log(data);
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

    const initPayload = {
      platform_name: PLATFORM_NAME,
      platform_key: PLATFORM_KEY,
      platform_secret: PLATFORM_SECRET,
      callback_url: CALLBACK_URL,
    };

    const initResponse = await postRequest(
      "/initiate-handshake",
      initPayload,
      "INITIATE HANDSHAKE"
    );

    if (!initResponse.success) {
      throw new Error(initResponse.message || "Initiate handshake failed");
    }

    const handshakeToken = initResponse.data.handshake_token;

    console.log("\n✔ Handshake token received:");
    console.log(handshakeToken);

    console.log("\n🔄 Step 2: Completing handshake...\n");

    const completePayload = {
      handshake_token: handshakeToken,
      platform_key: PLATFORM_KEY,
    };

    const completeResponse = await postRequest(
      "/complete-handshake",
      completePayload,
      "COMPLETE HANDSHAKE"
    );

    if (!completeResponse.success) {
      throw new Error(completeResponse.message || "Complete handshake failed");
    }

    const data = completeResponse.data;

    // ================== FINAL OUTPUT ==================
    console.log("\n🎉 DONE SUCCESSFULLY\n");

    console.log("🔑 ACCESS TOKEN:");
    console.log(data.access_token);

    console.log("\n🔁 REFRESH TOKEN:");
    console.log(data.refresh_token);

    console.log("\n⏱️ EXPIRES AT:");
    console.log(data.expires_at);

    console.log("\n✅ Flow completed\n");
  } catch (err) {
    console.error("\n❌ ERROR:", err.message);
  }
}

// ================== RUN ==================
runHandshake();