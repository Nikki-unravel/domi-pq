/**
 * Pubquiz – scoreopslag (Google Apps Script, gekoppeld aan een Google Sheet).
 * Tabblad "Scores": Tijd | Naam | Score | Antwoorden
 */
var BLAD = "Scores";

function normaliseer_(s) {
  return String(s == null ? "" : s).toLowerCase().replace(/\s+/g, "");
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function blad_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(BLAD);
  if (!sheet) {
    sheet = ss.insertSheet(BLAD);
    sheet.appendRow(["Tijd", "Naam", "Score", "Antwoorden"]);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Tijd", "Naam", "Score", "Antwoorden"]);
  }
  return sheet;
}

function bestaatNaam_(sheet, naam) {
  var doel = normaliseer_(naam);
  var laatste = sheet.getLastRow();
  if (laatste < 2) return false;
  var namen = sheet.getRange(2, 2, laatste - 1, 1).getValues();
  for (var i = 0; i < namen.length; i++) {
    if (normaliseer_(namen[i][0]) === doel) return true;
  }
  return false;
}

function doGet(e) {
  var naam = e && e.parameter ? e.parameter.naam : "";
  if (!naam) return json_({ bestaat: false });
  return json_({ bestaat: bestaatNaam_(blad_(), naam) });
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, reden: "ongeldige invoer" });
  }
  var naam = String(data.naam == null ? "" : data.naam).trim().replace(/\s+/g, " ");
  var score = Number(data.score);
  if (!naam || naam.length > 30 || isNaN(score)) {
    return json_({ ok: false, reden: "ongeldige invoer" });
  }
  var antwoorden = Array.isArray(data.antwoorden) ? data.antwoorden.join(" | ") : String(data.antwoorden || "");

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, reden: "server druk, probeer opnieuw" });
  }
  try {
    var sheet = blad_();
    if (bestaatNaam_(sheet, naam)) {
      return json_({ ok: false, reden: "naam bestaat al" });
    }
    sheet.appendRow([new Date(), naam, score, antwoorden]);
    SpreadsheetApp.flush();
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
