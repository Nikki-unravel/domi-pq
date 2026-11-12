// Gebruik: node hash.js "jouw-nieuwe-wachtwoord"
// Plak de uitvoer in index.html bij WACHTWOORD_HASH.
const crypto = require("crypto");
const wachtwoord = process.argv[2];
if (!wachtwoord) {
  console.error('Gebruik: node hash.js "wachtwoord"');
  process.exit(1);
}
console.log(crypto.createHash("sha256").update(wachtwoord, "utf8").digest("hex"));
