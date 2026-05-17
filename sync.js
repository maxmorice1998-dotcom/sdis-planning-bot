const axios = require("axios");
const { google } = require("googleapis");
console.log("🚀 Bot SDIS démarré");
console.log("COOKIE présent ?", !!process.env.SDIS_COOKIE);
const SDIS_URL = "https://agatt.sdis14.fr/ajax/index.php";

// ⚠️ récupéré depuis GitHub Secrets
const COOKIE = process.env.SDIS_COOKIE;

// Google auth
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

async function getPlanning(date) {
  console.log("📡 Appel SDIS...");

  try {
    const res = await axios.post(
      SDIS_URL,
      new URLSearchParams({
        a: "infobulleOccupations",
        idPersonnel: "3873",
        date: date,
      }),
      {
        headers: {
          Cookie: COOKIE,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("📡 Réponse SDIS :");
    console.log(res.data);

    return res.data;

  } catch (err) {
    console.log("❌ ERREUR SDIS :", err.message);

    if (err.response) {
      console.log("📄 Réponse erreur :", err.response.data);
    }

    return null;
  }
}

function parsePlanning(text, date) {
  const events = [];

  if (!text.includes("IFS")) return events;

  const match = text.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);

  if (!match) return events;

  let start = match[1];
  let end = match[2];

  let startDate = new Date(`${date}T${start}:00`);
  let endDate = new Date(`${date}T${end}:00`);

  // gestion garde 24h
  if (endDate <= startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }

  events.push({
    summary: "Garde SDIS",
    start: startDate,
    end: endDate,
    description: text,
  });

  return events;
}

async function pushToCalendar(events) {
  for (let ev of events) {
    await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: ev.summary,
        description: ev.description,
        start: { dateTime: ev.start.toISOString() },
        end: { dateTime: ev.end.toISOString() },
      },
    });
  }
}

async function main() {
  const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  const data = await getPlanning(today);

  const events = parsePlanning(data, today);

  if (events.length === 0) {
    console.log("Aucun planning");
    return;
  }

  await pushToCalendar(events);

  console.log("Sync OK");
}

main().catch(console.error);
