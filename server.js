const express = require('express');
const cors = require('cors');
const { Seam } = require('seam');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const seam = new Seam(process.env.SEAM_API_KEY);

let apiUrl;

const startServer = () => {
  const server = app.listen(0, () => {
    const port = server.address().port;
    const host = process.env.HOST || 'localhost';
    const protocol = process.env.PROTOCOL || 'http';
    const localUrl = `${protocol}://${host}:${port}`;
    apiUrl = process.env.API_URL || localUrl;

    console.log(`Server running at: ${apiUrl}`);
    console.log(`Get client session token at: ${apiUrl}/get-client-session-token`);
    console.log(`Get devices at: ${apiUrl}/get-devices`);
  });
};

app.post('/get-client-session-token', async (req, res) => {
  try {
    const userId = req.body.userId || 'single_user_11'; // Use provided userId or default

    let clientSession;
    try {
      clientSession = await seam.clientSessions.get({
        user_identifier_key: userId
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        clientSession = await seam.clientSessions.create({
          user_identifier_key: userId,
          expires_in: 3600
        });
      } else {
        throw error;
      }
    }

    res.json({ clientSessionToken: clientSession.client_session_id });
  } catch (error) {
    console.error('Error handling client session:', error);
    res.status(500).json({ error: 'Failed to handle client session' });
  }
});

app.get('/get-devices', async (req, res) => {
  try {
    const devices = await seam.devices.list();
    res.json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Only start the server if this file is being run directly
if (require.main === module) {
  startServer();
}

// Export the app for potential use in other files
module.exports = app;
