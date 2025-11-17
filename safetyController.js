require("dotenv").config();
const fs = require("fs");
const path = require("path");
const twilio = require("twilio");

// ---------------------- NEW TWILIO SETUP ----------------------
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// ---------------------- JSON STORAGE SETUP ----------------------
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const eventsFile = path.join(dataDir, "events.json");
const trustedFile = path.join(dataDir, "trusted.json");

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch (e) {
    return [];
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// =====================================================================
// 1️⃣  FINAL SOS FUNCTION — SAVES EVENT + SENDS SMS TO TRUSTED CONTACTS
// =====================================================================
exports.createSOS = async (req, res) => {
  try {
    const body = req.body || {};
    const { lat, lng, note } = body;

    // Save event to JSON
    const event = { type: "sos", ts: new Date().toISOString(), body };
    const eventList = readJSON(eventsFile);
    eventList.push(event);
    writeJSON(eventsFile, eventList);

    // Read trusted contacts
    const trustedContacts = readJSON(trustedFile);
    if (trustedContacts.length === 0) {
      return res.json({ ok: false, msg: "No trusted contacts added" });
    }

    // SMS content
    const messageText = `
Sent from your Twilio trial account
🚨 SOS ALERT 🚨

A user triggered SOS!

📍 Location:
https://www.google.com/maps?q=${lat},${lng}

📝 Note:
${note}
    `;

    // Send SMS to each trusted contact
    for (let t of trustedContacts) {
      await client.messages.create({
        body: messageText,
        from: FROM_NUMBER,
        to: t.phone
      });

      console.log("📨 SMS SENT TO:", t.phone);
    }

    return res.json({ ok: true, sms: true });

  } catch (err) {
    console.error("❌ SMS ERROR:", err.message);
    return res.json({ ok: false, error: err.message });
  }
};

// =========================================================
// 2️⃣  GET ALL EVENTS
// =========================================================
exports.getEvents = (req, res) => {
  res.json(readJSON(eventsFile));
};

// =========================================================
// 3️⃣  ADD TRUSTED CONTACT
// =========================================================
exports.addTrusted = (req, res) => {
  const contact = req.body;

  if (!contact || !contact.name || !contact.phone) {
    return res.status(400).json({ ok: false, error: "Invalid contact" });
  }

  const list = readJSON(trustedFile);
  contact.id = Date.now(); // simple ID
  list.push(contact);

  writeJSON(trustedFile, list);

  console.log("➕ Trusted contact added:", contact);

  res.json({ ok: true, trusted: list });
};

// =========================================================
// 4️⃣  GET TRUSTED CONTACTS
// =========================================================
exports.getTrusted = (req, res) => {
  res.json(readJSON(trustedFile));
};

// =========================================================
// 5️⃣  DRIVER VERIFY
// =========================================================
exports.verifyDriver = (req, res) => {
  const { plate } = req.body || {};

  if (!plate) {
    return res.status(400).json({ ok: false, error: "No plate provided" });
  }

  const verified = plate.trim().length >= 4;
  const riskScore = Math.floor(Math.random() * 100);

  res.json({
    ok: true,
    plate,
    verified,
    riskScore,
    note: "Demo verification — replace with real service later"
  });
};

// =========================================================
// 6️⃣  COMPANION CHECK-IN
// =========================================================
exports.checkin = (req, res) => {
  const body = req.body || {};
  const event = { type: "companion_checkin", ts: new Date().toISOString(), body };

  const list = readJSON(eventsFile);
  list.push(event);
  writeJSON(eventsFile, list);

  console.log("🟢 Companion Check-in");
  res.json({ ok: true });
};
