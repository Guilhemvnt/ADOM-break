# Google Sheets Integration Setup

To enable uploading game stats to a Google Sheet, follow these steps:

1. **Create a new Google Sheet**.
2. **Open Extensions > Apps Script**.
3. **Paste the following code** into the script editor (`Code.gs`):

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date', 'Winner', 'Target', 'Players', 'Darts Thrown']);
  }
  
  sheet.appendRow([
    data.date,
    data.winner,
    data.target,
    data.players,
    data.dartsThrown
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. **Click "Deploy" > "New deployment"**.
5. Select **"Web app"** as the type.
6. Set **"Execute as"** to **"Me"**.
7. Set **"Who has access"** to **"Anyone"**.
8. Click **"Deploy"**.
9. **Copy the "Web App URL"**.
10. Open your Darts App, finish a game, and **paste the URL** when prompted.
