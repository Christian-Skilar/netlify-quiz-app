// functions/saveQuizResults.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

    // Authenticate
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // Prepare row data with correct column mapping
    const rowData = {
      Timestamp: data.timestamp || new Date().toISOString(), // Column A
      Q1: data.answers[1] || 'Not answered',                 // Column B
      Q2: data.answers[2] || 'Not answered',                 // Column C
      Q3: data.answers[3] || 'Not answered',                 // Column D
      Q4: data.answers[4] || 'Not answered',                 // Column E
      Score: data.score                                      // Column F
    };

    // Add row
    const addedRow = await sheet.addRow(rowData);
    const rowNumber = addedRow.rowNumber;

    // Apply color formatting
    await sheet.loadCells({
      startRowIndex: rowNumber - 1,
      endRowIndex: rowNumber,
      startColumnIndex: 1, // Column B (Q1)
      endColumnIndex: 5    // Column E (Q4)
    });

    // Color cells B-E based on correctness
    for (let q = 1; q <= 4; q++) {
      const cell = sheet.getCell(rowNumber - 1, q); // Rows are 0-indexed
      cell.backgroundColor = data.answers[q] === getCorrectAnswer(q)
        ? { red: 0.2, green: 0.7, blue: 0.2 }  // Green for correct
        : { red: 0.9, green: 0.2, blue: 0.2 }; // Red for wrong
    }

    await sheet.saveUpdatedCells();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Results saved to columns A-F with color coding' })
    };

  } catch (error) {
    console.error('Detailed error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      })
    };
  }
};

// Helper function to get correct answers
function getCorrectAnswer(questionId) {
  const questions = {
    1: "Ignore",
    2: "Can be",
    3: "To good to be true",
    4: "Forward mail to the bank"
  };
  return questions[questionId];
}