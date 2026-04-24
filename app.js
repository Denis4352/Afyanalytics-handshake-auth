require("dotenv").config();
const axios = require("axios");

console.log("🚀 App is starting...");

const BASE_URL = process.env.BASE_URL;

async function run() {
  try {
    // =========================
    // STEP 1: INITIATE HANDSHAKE
    // =========================
    console.log("\n🔐 Step 1: Initiating handshake...");

    const initRes = await axios.post(`${BASE_URL}/initiate-handshake`, {
      platform_name: process.env.PLATFORM_NAME,
      platform_key: process.env.PLATFORM_KEY,
      platform_secret: process.env.PLATFORM_SECRET,
      callback_url: process.env.CALLBACK_URL || "http://localhost:3000/callback"
    });

    const initData = initRes.data.data;

    console.log("\n✅ Handshake Initiated Successfully");
    console.log("Handshake Token:", initData.handshake_token);
    console.log("⏳ Expires In:", initData.expires_in_seconds, "seconds");
    console.log("🕒 Expires At:", initData.expires_at);

    const token = initData.handshake_token;

    if (!token) {
      throw new Error("Handshake token not received");
    }

    // =========================
    // STEP 2: COMPLETE HANDSHAKE
    // =========================
    console.log("\n🔄 Step 2: Completing handshake...");

    const completeRes = await axios.post(`${BASE_URL}/complete-handshake`, {
      handshake_token: token,
      platform_key: process.env.PLATFORM_KEY
    });

    const completeData = completeRes.data.data;

    console.log("\n🎉 Handshake Completed Successfully");
    console.log("Access Token:", completeData.access_token);
    console.log("Refresh Token:", completeData.refresh_token);
    console.log("Token Expires At:", completeData.expires_at);

  } catch (err) {
    console.error("\n❌ ERROR OCCURRED");

    const error = err.response?.data || err.message;
    console.error(error);

    // =========================
    // EXPIRY HANDLING
    // =========================
    const msg = err.response?.data?.message?.toLowerCase();

    if (msg?.includes("expired")) {
      console.log("\n⚠️ Handshake token expired. Please re-initiate handshake.");
    }
  }
}

// =========================
// RUN APPLICATION
// =========================
run();