// functions/saveQuizResults.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

function formatNorwegianTimestamp() {
  const now = new Date();
  const options = {
    timeZone: 'Europe/Oslo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  return new Intl.DateTimeFormat('no-NO', options)
    .format(now)
    .replace(/,/g, '')
    .replace(/\s+/g, ' ');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

    // Authenticate
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    doc.auth = auth;

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // Prepare row data with Norwegian timestamp
    const rowData = {
      'Timestamp': formatNorwegianTimestamp(),
      'Q1': data.answers[1] || 'Not answered',
      'Q2': data.answers[2] || 'Not answered',
      'Q3': data.answers[3] || 'Not answered',
      'Q4': data.answers[4] || 'Not answered',
      'Score': data.score
    };

    const addedRow = await sheet.addRow(rowData);

    // Apply color formatting
    await sheet.loadCells({
      startRowIndex: addedRow.rowNumber - 1,
      endRowIndex: addedRow.rowNumber,
      startColumnIndex: 1,
      endColumnIndex: 5
    });

    const correctAnswers = {
      1: "Ignore",
      2: "Can be",
      3: "To good to be true",
      4: "Forward mail to the bank"
    };

    for (let q = 1; q <= 4; q++) {
      const cell = sheet.getCell(addedRow.rowNumber - 1, q);
      cell.backgroundColor = data.answers[q] === correctAnswers[q]
        ? { red: 0.2, green: 0.7, blue: 0.2 }  // Green
        : { red: 0.9, green: 0.2, blue: 0.2 }; // Red
    }

    await sheet.saveUpdatedCells();

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Results saved successfully',
        norwegianTime: formatNorwegianTimestamp()
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      })
    };
  }
};