import axios from "axios";
import { google } from "googleapis";

console.log("🚀 Bot SDIS démarré");
console.log("COOKIE présent ?", !!process.env.SDIS_COOKIE);

const SDIS_URL = "https://agatt.sdis14.fr/ajax/index.php";
const COOKIE = process.env.SDIS_COOKIE;

async function getPlanning(date) {
  console.log("📡 Appel SDIS...");

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
}

async function main() {
  const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  const data = await getPlanning(today);

  console.log("📦 DATA FINAL :", data);
}

main().catch(console.error);
