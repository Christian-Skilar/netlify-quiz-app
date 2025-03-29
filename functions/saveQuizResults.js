const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config();

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

    // Authenticate with service account credentials
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // Format answers with color coding
    const formattedAnswers = {};
    for (const [q, answer] of Object.entries(data.answers)) {
      const question = questions.find(q => q.id === parseInt(q));
      const isCorrect = answer === question.correctAnswer;
      formattedAnswers[`Q${q}`] = {
        value: answer,
        backgroundColor: isCorrect ? { red: 0.85, green: 0.97, blue: 0.80 } : { red: 0.96, green: 0.80, blue: 0.82 },
      };
    }

    // Add row with formatted data
    await sheet.addRow({
      Timestamp: new Date().toISOString(),
      ...formattedAnswers,
      Score: data.score,
    });

    // Apply color formatting
    await sheet.loadCells('A1:Z1000');
    const rows = await sheet.getRows();
    const lastRow = rows.length;
    
    questions.forEach((q, i) => {
      const cell = sheet.getCellByA1(`${String.fromCharCode(67 + i)}${lastRow}`);
      const answer = data.answers[q.id];
      if (answer === q.correctAnswer) {
        cell.backgroundColor = { green: 0.7, red: 0.2, blue: 0.2 }; // Light green
      } else {
        cell.backgroundColor = { red: 0.9, green: 0.6, blue: 0.6 }; // Light red
      }
    });

    await sheet.saveUpdatedCells();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Results saved successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Add your questions here (same as in React)
const questions = [
  {
    id: 1,
    question: "What do you do when you get this message?",
    correctAnswer: "Ignore"
  },
  {
    id: 2,
    question: "Are QR codes harmfull?",
    correctAnswer: "Can be"
  },
  {
    id: 3,
    question: "New iPhone 90% OFF!! Take action before its gone! What do you do?",
    correctAnswer: "To good to be true"
  },
  {
    id: 4,
    question: "You get email that appears to be from your bank, asking you to verify your account due to suspicious activity",
    correctAnswer: "Forward mail to the bank"
  },
];