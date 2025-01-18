require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// In-memory inventory storage (for now)
let inventory = [];

// Configure AWS SDK with your credentials
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Google Sheets API Setup
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_KEY_FILE_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// API to add item to inventory
app.post('/api/inventory', (req, res) => {
    const { name, quantity, price } = req.body;

    if (!name || !quantity || !price) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    const item = { name, quantity, price };
    inventory.push(item);

    // Upload the inventory data to S3
    const params = {
        Bucket: 'inventory-tracker-system', // The bucket name
        Key: 'inventory.json', // The file name to save in S3
        Body: JSON.stringify(inventory), // The data to upload
        ContentType: 'application/json', // The content type of the file
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error uploading to S3:', err);
            return res.status(500).json({ error: 'Failed to upload to S3' });
        }

        // Now update Google Sheets with the new item
        updateGoogleSheet(item)
            .then(() => {
                res.status(200).json({ message: 'Item added, inventory uploaded to S3, and Google Sheets updated!', item });
            })
            .catch((error) => {
                console.error('Error updating Google Sheets:', error);
                res.status(500).json({ error: 'Failed to update Google Sheets' });
            });
    });
});

async function updateGoogleSheet(item) {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID; // Replace with your Google Sheets ID
    const range = 'Sheet1!A1'; // Replace with the range where data should go (starting from row 2)

    const values = [
        [item.name, item.quantity, item.price],
    ];

    const resource = {
        values,
    };

    try {
        // Write the new row to Google Sheets
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource,
        });
    } catch (error) {
        console.error("Error updating Google Sheets:", error.response ? error.response.data : error.message);
        throw error; // Re-throw the error after logging it
    }
}

// API to get all inventory items
app.get('/api/inventory', (req, res) => {
    res.status(200).json(inventory);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
