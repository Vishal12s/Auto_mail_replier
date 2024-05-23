const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const OpenAI = require('openai');
require('dotenv').config();



// Load OpenAI API key from environment variables or directly specify it here
const openaiApiKey = process.env.OPENAI_API_KEY || ;

// Initialize the OpenAI client
const openai = new OpenAI(openaiApiKey);
// If modifying these SCOPES, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';

function authenticateGmail() {
  return new Promise((resolve, reject) => {
    fs.readFile('credentials.json', (err, content) => {
      if (err) return reject('Error loading client secret file:', err);
      const { client_secret, client_id, redirect_uris } = JSON.parse(content).installed;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, resolve, reject);
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(oAuth2Client);
      });
    });
  });
}

function getNewToken(oAuth2Client, resolve, reject) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return reject('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return reject(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      resolve(oAuth2Client);
    });
  });
}

async function listMessages(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
  });
  return res.data.messages || [];
}

async function getMessage(auth, messageId) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
  });
  console.log('Message data:', res.data);
  return res.data;
}

async function sendMessage(auth, raw) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw: raw,
    },
  });
  return res.data;
}

function createAutoReply(to, subject, body) {
  const raw = [
    `To: ${to}`,
    'Subject: Re: ' + subject,
    '',
    body
  ].join('\n');
  return Buffer.from(raw).toString('base64');
}

async function generateReply(body) {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Reply to this email:\n\n${body}`,
      maxTokens: 150,
    });
    return response.choices[0].text.trim();
  }

async function processMessage(auth, message) {
  try {
    const headers = message.payload.headers;
    const subject = headers.find(header => header.name === 'Subject').value;
    const from = headers.find(header => header.name === 'From').value;

    let body = '';
    if (message.payload.body.size > 0) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf8');
    }

    const replyBody = await generateReply(body);
    const rawMessage = createAutoReply(from, subject, replyBody);
    await sendMessage(auth, rawMessage);
    console.log(`Replied to email from ${from}`);
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

(async () => {
  try {
    const auth = await authenticateGmail();
    const messages = await listMessages(auth);
    if (messages.length === 0) {
      console.log("No new messages.");
      return;
    }

    for (const message of messages) {
      const msg = await getMessage(auth, message.id);
      await processMessage(auth, msg);
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();
