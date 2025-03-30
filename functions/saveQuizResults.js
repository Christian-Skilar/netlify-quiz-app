// functions/saveQuizResults.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse incoming data
    const data = JSON.parse(event.body);
    console.log('Received data:', JSON.stringify(data, null, 2));

    // Initialize Google Sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

    // Authenticate with JWT
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY
        .replace(/\\n/g, '\n')  // Convert escaped newlines
        .replace(/"/g, ''),     // Remove any quotes
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    doc.auth = auth;

    // Load document
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    console.log('Connected to sheet:', doc.title);

    // Prepare row data (A-F columns)
    const rowData = {
      'Timestamp': data.timestamp || new Date().toISOString(),
      'Q1': data.answers[1] || 'Not answered',
      'Q2': data.answers[2] || 'Not answered',
      'Q3': data.answers[3] || 'Not answered',
      'Q4': data.answers[4] || 'Not answered',
      'Score': data.score || 0
    };

    // Add row
    const addedRow = await sheet.addRow(rowData);
    console.log('Added row at position:', addedRow.rowNumber);

    // Apply color formatting to answers (Columns B-E)
    await sheet.loadCells({
      startRowIndex: addedRow.rowNumber - 1,
      endRowIndex: addedRow.rowNumber,
      startColumnIndex: 1,  // Column B (Q1)
      endColumnIndex: 5     // Column E (Q4)
    });

    const correctAnswers = {
      1: "Ignore",
      2: "Can be",
      3: "To good to be true",
      4: "Forward mail to the bank"
    };

    for (let q = 1; q <= 4; q++) {
      const colIndex = q; // Columns B=1, C=2, etc.
      const cell = sheet.getCell(addedRow.rowNumber - 1, colIndex);
      
      if (data.answers[q] === correctAnswers[q]) {
        cell.backgroundColor = { red: 0.2, green: 0.7, blue: 0.2 }; // Green
      } else {
        cell.backgroundColor = { red: 0.9, green: 0.2, blue: 0.2 }; // Red
      }
    }

    await sheet.saveUpdatedCells();
    console.log('Applied color formatting');

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Results saved successfully',
        sheet: doc.title,
        row: addedRow.rowNumber
      })
    };

  } catch (error) {
    console.error('Full error:', {
      message: error.message,
      stack: error.stack,
      rawKey: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 20) + '...'
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to save results',
        details: error.message
      })
    };
  }
};