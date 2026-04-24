require("dotenv").config();
const axios = require("axios");

console.log("App is starting...");

const BASE_URL = process.env.BASE_URL;

async function run() {
  try {
    // Step 1: Initiate handshake
    const initRes = await axios.post(`${BASE_URL}/initiate-handshake`, {
      platform_name: process.env.PLATFORM_NAME,
      platform_key: process.env.PLATFORM_KEY,
      platform_secret: process.env.PLATFORM_SECRET,
      callback_url: process.env.CALLBACK_URL
    });

    console.log("✅ Handshake Initiated");
    console.log(initRes.data);

    const token = initRes.data.data.handshake_token;

    // Step 2: Complete handshake
    const completeRes = await axios.post(`${BASE_URL}/complete-handshake`, {
      handshake_token: token,
      platform_key: process.env.PLATFORM_KEY
    });

    console.log("✅ Handshake Completed");
    console.log(completeRes.data);

  } catch (err) {
    console.error("❌ ERROR:", err.response?.data || err.message);
  }
}

run();