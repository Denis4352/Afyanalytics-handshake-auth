# Afyanalytics External Platform Integration

## Overview
This project demonstrates integration with the Afyanalytics Health Platform using a secure two-step handshake authentication system.

The system:
- Initiates a handshake using platform credentials
- Receives a short-lived handshake token (15 minutes)
- Completes the handshake to obtain an access token

---

## Setup Instructions

### 1. Clone the repository
git clone https://github.com/Denis4352/Afyanalytics-handshake-auth.git

cd Afyanalytics-handshake-auth

### 2. Install dependencies
npm install

### 3. Create a .env file

BASE_URL=https://staging.collabmed.net/api/external

PLATFORM_NAME=Test Platform v2  
PLATFORM_KEY=afya_2d00d74512953c933172ab924f5073fa  
PLATFORM_SECRET=your_secret_here  
CALLBACK_URL=http://localhost:3000/callback  

---

### 4. Run the application
node app.js

---

## Authentication Flow

### Step 1: Initiate Handshake
Sends credentials to `/initiate-handshake` and receives:
- handshake_token
- expires_in_seconds
- expires_at

### Step 2: Complete Handshake
Uses token in `/complete-handshake` to get:
- access_token
- refresh_token

---

## Expiry Handling

- Token expires in 15 minutes
- Used immediately after generation
- If expired, new handshake is required
- Expired tokens are not reused

---

## Technologies Used

- Node.js
- Axios
- dotenv

---

## Author

Afyanalytics Integration Assignment