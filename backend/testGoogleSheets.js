const { google } = require('googleapis');
const path = require('path');

// Path to your service account JSON key file
const auth = new google.auth.GoogleAuth({
    keyFile: "C:/Users/solan/Downloads/woven-phoenix-447805-i2-c5e92db1c243.json", // Directly use the absolute path
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function testGoogleSheets() {
    const spreadsheetId = '1skJ-IDZCsDqPDrsCbGop4wDcWDQJmBaf7wAhpeXxiqc'; // Replace with your Google Sheets ID
    const range = 'Sheet1!A1';

    try {
        // Get the current data from Google Sheets
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        
        // Log the current data in the sheet
        console.log("Current data in the sheet:", res.data.values);
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error.message);
    }
}

testGoogleSheets().catch((error) => {
    console.error('Error:', error);
});
