require("dotenv").config();
const https = require("https");

console.log("🚀 App is starting...\n");

// ================== CONFIG ==================
const BASE_URL = "staging.collabmed.net";

const PLATFORM_NAME = process.env.PLATFORM_NAME;
const PLATFORM_KEY = process.env.PLATFORM_KEY;
const PLATFORM_SECRET = process.env.PLATFORM_SECRET;
const CALLBACK_URL =
  process.env.CALLBACK_URL || "https://your-platform.com/callback";

// ================== HELPER ==================
function postRequest(endpoint, payload, stepName) {
  // ✅ SHOW PARAMETERS SENT
  console.log("\n======================================");
  console.log(`=== PARAMETERS SENT IN ${stepName.toUpperCase()} ===`);
  console.log("======================================");
  console.log(JSON.stringify(payload, null, 2));

  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: `/api/external${endpoint}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // prevent hanging
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(data);

          // ✅ SHOW RESPONSE RECEIVED
          console.log("\n======================================");
          console.log(`=== RESPONSE FROM ${stepName.toUpperCase()} ===`);
          console.log("======================================");
          console.log(JSON.stringify(json, null, 2));

          resolve(json);
        } catch (err) {
          console.error("❌ Failed to parse response:", data);
          reject(err);
        }
      });
    });

    req.on("timeout", () => {
      console.error("⏱️ Request timed out");
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.on("error", (err) => {
      console.error("❌ Request error:", err.message);
      reject(err);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

// ================== MAIN ==================
async function runHandshake() {
  try {
    console.log("🔐 Step 1: Initiating handshake...\n");

    const initiatePayload = {
      platform_name: PLATFORM_NAME,
      platform_key: PLATFORM_KEY,
      platform_secret: PLATFORM_SECRET,
      callback_url: CALLBACK_URL,
    };

    const initResponse = await postRequest(
      "/initiate-handshake",
      initiatePayload,
      "Initiate Handshake"
    );

    if (!initResponse.success) {
      throw new Error("Initiate handshake failed");
    }

    const handshakeToken = initResponse.data.handshake_token;

    console.log("\n✅ Handshake Initiated Successfully");
    console.log("Handshake Token:", handshakeToken);

    console.log("\n🔄 Step 2: Completing handshake...\n");

    const completePayload = {
      handshake_token: handshakeToken,
      platform_key: PLATFORM_KEY,
    };

    const completeResponse = await postRequest(
      "/complete-handshake",
      completePayload,
      "Complete Handshake"
    );

    if (!completeResponse.success) {
      throw new Error("Complete handshake failed");
    }

    console.log("\n🎉 Handshake Completed Successfully");
    console.log("Access Token:", completeResponse.data.access_token);
    console.log("Refresh Token:", completeResponse.data.refresh_token);

    console.log("\n✅ FULL FLOW COMPLETE\n");
  } catch (err) {
    console.error("\n❌ ERROR:", err.message);
  }
}

// ================== RUN ==================
runHandshake();