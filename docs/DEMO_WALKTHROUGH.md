# iTransfr Demo Walkthrough script

**Target Audience:** Superior / Stakeholders
**Goal:** Demonstrate a complete end-to-end remittance flow from User Signup to Final Payout, highlighting specific integrations.
**Total Time:** ~5-7 Minutes

---

## 🎬 Pre-Demo Setup
1.  Open **two browser windows** (Incognito is best for the Client):
    *   **Window A (Admin):** Logged into `localhost:3000/admin/login` (Admin Console).
    *   **Window B (Client):** `localhost:3000/` (Client Portal).
2.  Have your **Admin Email** ready (e.g., `admin@itransfr.com`).
3.  Have a fresh **Client Email** ready (e.g., `demo_user@example.com`).

---

## 🚀 Phase 1: Client Onboarding (The "Trust" Phase)
*Narrative: "First, let's show how easily a new user can onboard and get verified using our automated compliance stack."*

1.  **Sign Up (Window B)**
    *   Go to `/signup`.
    *   Create account `demo_user@example.com`.
    *   *Show:* Dashboard appears, but "Your account is not verified" banner is visible.

2.  **KYC Submission**
    *   Click **"Verify Identity"**.
    *   Fill in dummy details (Name: "Raj Demo", Country: "India").
    *   **Upload**: Upload any sample image for Passport and Selfie.
    *   Click **Submit**.
    *   *Explain:* "Right now, this data is being processed secure storage. In production, this pings **AMLBot** for identity verification. For this demo, it goes to our Admin queue."

3.  **Admin Approval (Window A)**
    *   Go to **Admin Dashboard**.
    *   Click **KYC Review**.
    *   See "Raj Demo" in the list. Click **Review**.
    *   *Action:* Click **Approve**.
    *   *Explain:* "Admin has full control to override AI decisions. We've just approved Raj."

---

## 💰 Phase 2: Deposit (The "Inbound" Phase)
*Narrative: "Now Raj needs to fund his account. We use **Turnkey** to generate secure crypto wallets on the fly."*

1.  **Generate Wallet (Window B)**
    *   Refresh Client Dashboard (should be Verified now).
    *   Click **Deposit**.
    *   Select **USDT** (Ethereum or Tron).
    *   *Show:* A unique wallet address appears.
    *   *Explain (Turnkey):* "This address was just generated via **Turnkey API**. It's a non-custodial-style sub-wallet specific to this user."

2.  **Simulate Transfer**
    *   *Narrative:* "Raj sends 1,000 USDT from his Binance account."
    *   (Since we don't want to wait for real blockchain confirmation):
    *   Switch to **Window A (Admin)**.
    *   Go to **Transactions**.
    *   You won't see it yet (because we aren't listening to the real blockchain).
    *   **Create Manual Deposit**: (If distinct UI exists) OR generally for the demo, we assume the user clicked "I have sent funds".
    *   *Alternative (if no manual create button):* The user just told us.
    *   *Action:* As Admin, find the **"Simulate Incoming Deposit"** feature (if built) OR use the **"Manual Deposit"** SQL/Tool.
    *   *(Self-Correction)*: In our verified flow, the Client creates a "Deposit Request" first.
    *   **Back to Window B (Client)**: On Deposit page, ensure you clicked "Notify of Transfer" or similar if implemented. If not, standard flow is Admin manually credits.
    *   **Admin Action**: Admin manually adds funds or "Marks Received" on a pending request.
    *   *Result:* Client Balance updates to **$1,000.00**.

---

## 💱 Phase 3: The Transfer (The "Engine" Phase)
*Narrative: "Here is the core product. Sending money internationally."*

1.  **Initiate Transfer (Window B)**
    *   Click **Send Money**.
    *   **Amount**: Enter `$1,000`.
    *   **Recipient**: "Priya Sharma" (Bank: SBI India, IFSC: SBIN0001234).
    *   *Show:* The UI calculates fees and exchange rate.
    *   Click **Send**.
    *   *Explain:* "The user's wallet is immediately debited to prevent double-spending."
    *   *Show:* Transaction in "History" as `Pending`.

---

## ⚙️ Phase 4: Admin Execution (The "Magic" Phase)
*Narrative: "Behind the scenes, we handle the complexity of FX and global banking so the user doesn't have to."*

1.  **Review Transaction (Window A)**
    *   Go to **Transactions**.
    *   See the new transaction: `Type: Payout`, `Status: Pending`.
    *   *Explain (AML)*: "Our system just ran an internal **AML Check** (Velocity & Limits). Risk Score: Low."

2.  **Execute Swap (Bitso Integration)**
    *   Click **View Details** or the **Swap Icon**.
    *   *Explain (Bitso):* "We hold USDT, but we need INR. We use **Bitso** to swap instant liquidity."
    *   Action: Click **Execute Swap**.
    *   *Result:* Status changes to `SWAP_COMPLETED`.
    *   *Note:* "This used our **Simulation Mode** because we are in a demo environment, ensuring 100% uptime for this presentation."

3.  **Send Payout (Infinitus Integration)**
    *   Action: Click **Send Payout**.
    *   *Explain (Infinitus):* "Finally, we instruct **Infinitus** to wire funds to the specific Indian bank account via local rails (IMPS/NEFT)."
    *   *Result:* Status changes to `PAYOUT_COMPLETED`.

---

## 📄 Phase 5: Receipts & Trust
1.  **Client Confirmation (Window B)**
    *   Go to **Transactions**.
    *   See Status: `Completed`.
    *   Click **View Receipt**.
    *   *Show:* Professional PDF receipt pops up.
    *   *Closing:* "Raj gets an email instantly. The money is in India. End of demo."

---

## 🧩 Integration Status Cheat Sheet

| Service | Role | Current Demo Status |
| :--- | :--- | :--- |
| **Turnkey** | Wallet & Address Generation | **Real API** (or mocked response if keys missing). |
| **Bitso** | Currency Exchange (USDT -> Fiat) | **Simulation Mode** (Guarantees success without real funds). |
| **Infinitus**| Bank Payouts (Fiat -> Bank) | **Simulation Mode** (Mimics exact API delays/responses). |
| **AMLBot** | Compliance Screening | **Internal Logic** (Simulates scores based on amounts/history). |

