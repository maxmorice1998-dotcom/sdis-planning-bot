import axios from "axios";
import { google } from "googleapis";

console.log("🚀 Bot SDIS démarré");
console.log("COOKIE présent ?", !!process.env.SDIS_COOKIE);

const SDIS_URL = "https://agatt.sdis14.fr/ajax/index.php";
const COOKIE = process.env.SDIS_COOKIE;

async function getPlanning(date) {
  console.log("📡 Appel SDIS...");

  console.log("📡 START REQUEST SDIS");

const res = await axios({
  method: "POST",
  url: SDIS_URL,
  data: new URLSearchParams({
    a: "infobulleOccupations",
    idPersonnel: "3873",
    date: date,
  }).toString(),
  headers: {
    Cookie: COOKIE,
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0",
    "Accept": "*/*",
  },
  maxRedirects: 0,
  validateStatus: null,
  timeout: 10000
});

console.log("📡 STATUS :", res.status);
console.log("📡 HEADERS :", res.headers);
console.log("📡 DATA TYPE :", typeof res.data);
console.log("📡 DATA LENGTH :", res.data?.length);
console.log("📡 DATA RAW :");
console.log(res.data);
}

async function main() {
  const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  const data = await getPlanning(today);

  console.log("📦 DATA FINAL :", data);
}

main().catch(console.error);
