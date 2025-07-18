const fs = require('fs').promises;
const { dirname } = require('path');
const path = require('path')
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];
const CURR_DIR = dirname(__filename)
const TOKEN_PATH = path.join(CURR_DIR, 'token.json');
const CREDS_PATH = path.join(CURR_DIR, 'credentials.json');

// helpers
async function loadSaved() {
    try { return google.auth.fromJSON(JSON.parse(await fs.readFile(TOKEN_PATH))); }
    catch (e) { return null; }
}

async function save(creds) {
    const keys = JSON.parse(await fs.readFile(CREDS_PATH)).installed;
    const payload = {
        type: 'authorized_user',
        client_id: keys.client_id,
        client_secret: keys.client_secret,
        refresh_token: creds.credentials.refresh_token
    };
    // if (fs.existsSync(TOKEN_PATH)) {
    //     await fs.unlink(TOKEN_PATH)
    // }
    await fs.writeFile(TOKEN_PATH, JSON.stringify(payload));
}

async function auth() {
    let client = await loadSaved();
    if (!client) {
        client = await authenticate({ scopes: SCOPES, keyfilePath: CREDS_PATH });
        if (client.credentials) await save(client);
    }
    return client;
}

// bidnid logic
async function fetchUnread(auth) {
    const gmail = google.gmail({ version: 'v1', auth })

    // list unread ids
    const { data } = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 25
    });
    const msgs = data.messages || [];
    if (!msgs.length) return console.log('🎊 Inbox already zero 0️⃣');

    const out = [];
    for (const { id } of msgs) {
        const { data: msg } = await gmail.users.messages.get({
            userId: 'me',
            id,
            format: 'metadata',
            metadataHeaders: ['Subject']
        });
        const headers = Object.fromEntries(
            msg.payload.headers.map(({ name, value }) => [name, value])
        );
        out.push({
            id,
            threadId: msg.threadId,
            from: headers.From,
            subject: headers.Subject,
            date: headers.Date
        });
    }

    await fs.writeFile('aggregated.json', JSON.stringify(out, null, 2));
    console.log(`✅ saved ${out.length} messages -> aggregated.json`);
}

auth().then(fetchUnread).catch(console.error);