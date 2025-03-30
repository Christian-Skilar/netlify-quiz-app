// functions/saveQuizResults.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Helper function to format timestamp
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}.${month}.${year} - ${hours}:${minutes}`;
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

    // Format timestamp (DD.MM.YYYY - HH:mm)
    const formattedTimestamp = formatTimestamp(data.timestamp || new Date().toISOString());

    // Prepare row data
    const rowData = {
      'Timestamp': formattedTimestamp,  // Now in your preferred format
      'Q1': data.answers[1] || 'Not answered',
      'Q2': data.answers[2] || 'Not answered',
      'Q3': data.answers[3] || 'Not answered',
      'Q4': data.answers[4] || 'Not answered',
      'Score': data.score
    };

    const addedRow = await sheet.addRow(rowData);

    // Apply color formatting (B-E columns)
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
        timestamp: formattedTimestamp  // Return formatted timestamp in response
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