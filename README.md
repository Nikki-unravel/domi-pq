# Pubquiz

Een mobiel-vriendelijke pubquiz in één bestand (`index.html`, geen build, geen libraries) plus een Google Apps Script (`apps-script.gs`) dat de scores in een Google Sheet bewaart.

| Bestand | Wat |
|---|---|
| `index.html` | De hele quiz (wachtwoord → naam → 15 vragen → eindscherm). Vragen staan als JSON-array bovenin. |
| `apps-script.gs` | Scoreopslag: duplicate-check op naam en rij toevoegen in tabblad "Scores". |
| `hash.js` | Maakt een nieuwe wachtwoord-hash. |

## 1. Google Sheet + Apps Script

1. Maak een nieuwe Google Sheet (bijv. "Pubquiz scores").
2. Ga naar **Extensies > Apps Script**.
3. Wis de standaardcode en plak de inhoud van `apps-script.gs`. Sla op (bijv. naam "Pubquiz").
4. Klik **Implementeren > Nieuwe implementatie**, kies het tandwiel naast "Type selecteren" > **Web-app**.
   - **Uitvoeren als:** ik
   - **Wie heeft toegang:** iedereen
5. Klik **Implementeren** en geef de gevraagde toestemming (Google waarschuwt dat de app niet gecontroleerd is: *Geavanceerd > Doorgaan*).
6. Kopieer de **Web-app-URL** (eindigt op `/exec`).
7. Open `index.html` en vervang `PLAK_HIER_DE_APPS_SCRIPT_URL` bij `SCRIPT_URL` door die URL.
8. Test: open `<web-app-URL>?naam=test` in je browser; je hoort `{"bestaat":false}` te zien. Doe daarna zelf één testinzending via de quiz en verwijder die rij uit de Sheet.

> Wijzig je het script later, dan moet je opnieuw implementeren (**Implementeren > Implementaties beheren > bewerken > Nieuwe versie**), anders blijft de oude code actief.

Het tabblad "Scores" wordt automatisch aangemaakt met de kolommen **Tijd | Naam | Score | Antwoorden**. De naamcontrole is hoofdletter- en spatie-ongevoelig, en `LockService` voorkomt dat gelijktijdige inzendingen dezelfde naam kunnen krijgen.

### Ranglijst

Maak een tweede tabblad "Ranglijst" en zet in cel A1:

```
=SORT(Scores!A2:C; 3; FALSE; 1; TRUE)
```

Dat sorteert op kolom 3 (Score) aflopend en bij gelijke score op kolom 1 (Tijd) oplopend. Dat past bij de kolomvolgorde Tijd | Naam | Score. Heeft je Sheet een Engelse taalinstelling, gebruik dan komma's: `=SORT(Scores!A2:C, 3, FALSE, 1, TRUE)`.

Let op: "Tijd" is het moment van **inzenden**. Bij gelijke score staat dus degene bovenaan die als eerste klaar was en zijn score doorstuurde. Dat is niet noodzakelijk de snelste speler (de invultijd wordt niet gemeten).

## 2. GitHub Pages

1. Maak op github.com een nieuwe repository (**New repository**), bijv. `pubquiz`.
2. Upload `index.html` (**Add file > Upload files**) en commit.
3. Ga naar **Settings > Pages**. Kies bij *Source* **Deploy from a branch**, en bij *Branch* **main** met map **/ (root)**. Klik **Save**.
4. Na een minuut staat de quiz op:

   `https://<gebruikersnaam>.github.io/<repo>/`

   Bijvoorbeeld `https://jouwnaam.github.io/pubquiz/`.

> **Let op: openbare repo.** GitHub Pages op een gratis account vereist een publieke repository. Daarmee zijn de code, **alle vragen met de juiste antwoorden** en de wachtwoord-hash zichtbaar voor iedereen die de repo of pagina-broncode opent. Dat is prima voor een speelse pubquiz, maar het wachtwoord is een drempel en geen echte beveiliging. Zet `apps-script.gs` en `hash.js` niet in de repo als je dat niet wilt, ze zijn voor de quiz zelf niet nodig.

## 3. Wachtwoord wijzigen

Het wachtwoord staat niet in platte tekst in de code, alleen de SHA-256-hash (`WACHTWOORD_HASH` bovenin het script in `index.html`).

Nieuwe hash maken, met Node:

```bash
node hash.js "jouw-nieuwe-wachtwoord"
```

of zonder Node, in de Terminal op macOS/Linux:

```bash
printf '%s' 'jouw-nieuwe-wachtwoord' | shasum -a 256
```

Plak de 64 tekens (zonder het streepje) bij `WACHTWOORD_HASH` in `index.html` en upload het bestand opnieuw. Zonder spaties of regeleinde invoeren: elk extra teken verandert de hash.

## Vragen aanpassen

Bovenin het script in `index.html` staat `VRAGEN`, een array met per vraag: `vraag`, `opties[]`, `juist` (index vanaf 0) en `grapje`. De volgorde van opties wordt bij elke speler geschud. Bij een ander aantal vragen: de "x/15"-tekst volgt automatisch, maar controleer de score-titels (`TITELS`).

## Hoe het werkt

- Na het afronden staat in `localStorage` dat deze browser klaar is. Heropenen toont direct het eindscherm. Wie localStorage wist of een andere browser gebruikt kan opnieuw beginnen, alleen een nieuwe naam is dan nodig (dubbele namen worden geweigerd).
- Mislukt het versturen, dan blijft de score staan als "nog te versturen" en wordt het bij de volgende keer openen opnieuw geprobeerd. Daarnaast kan de speler het resultaat kopiëren en handmatig doorgeven.
- Een onderbroken quiz wordt bij heropenen hervat, zonder antwoorden te kunnen wijzigen.
