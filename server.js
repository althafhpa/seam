const express = require('express');
const cors = require('cors');
const { Seam } = require('seam');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const seam = new Seam(process.env.SEAM_API_KEY);

app.get('/get-client-session-token', async (req, res) => {
  try {
    const userId = 'single_user_11'; // Replace with actual user ID logic

    // First, try to get an existing session
    let clientSession;
    try {
      clientSession = await seam.clientSessions.get({
        user_identifier_key: userId
      });
    } catch (error) {
      // If session doesn't exist, create a new one
      if (error.message.includes('not found')) {
        clientSession = await seam.clientSessions.create({
          user_identifier_key: userId,
          expires_in: 3600
        });
      } else {
        throw error; // Re-throw if it's a different error
      }
    }

    res.json({ clientSessionToken: clientSession.client_session_id });
  } catch (error) {
    console.error('Error handling client session:', error);
    res.status(500).json({ error: 'Failed to handle client session' });
  }
});


// app.get('/get-client-session-token', async (req, res) => {
//   try {
//     const clientSession = await seam.clientSessions.create({
//       user_identifier_key: 'single_user_11',
//       expires_in: 3600
//     });
//     console.log('Client Session:', JSON.stringify(clientSession, null, 2));
//     res.json({ clientSessionToken: clientSession.client_session_id });
//   } catch (error) {
//     console.error('Error generating client session token:', error);
//     res.status(500).json({ error: 'Failed to generate client session token' });
//   }
// });

// New endpoint to get devices
app.get('/get-devices', async (req, res) => {
  try {
    const devices = await seam.devices.list();
    res.json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
})



const server = app.listen(0, () => {
  const port = server.address().port;
  const fullUrl = `http://localhost:${port}`;
  console.log(`Server running at: ${fullUrl}`);
  console.log(`Get client session token at: ${fullUrl}/get-client-session-token`);
  console.log(`Get devices at: ${fullUrl}/get-devices`);
});


