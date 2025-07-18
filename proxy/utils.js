const fs = require('fs/promises');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

async function getOAuthClientFromToken() {
  const tokenData = JSON.parse(await fs.readFile(process.env.TOKEN_PATH, 'utf-8'));

  const oAuth2Client = new google.auth.OAuth2(
    tokenData.client_id,
    tokenData.client_secret,
    process.env.OAUTH_REDIRECT_URI
  );

  oAuth2Client.setCredentials({
    refresh_token: tokenData.refresh_token,
  });

  return oAuth2Client;
}

async function sendMail({ to, subject, text }) {
  const oAuth2Client = await getOAuthClientFromToken();
  const accessTokenObj = await oAuth2Client.getAccessToken();

  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     type: 'OAuth2',
  //     user: process.env.MAIL_USER,
  //     clientId: oAuth2Client._clientId,
  //     clientSecret: oAuth2Client._clientSecret,
  //     refreshToken: oAuth2Client.credentials.refresh_token,
  //     accessToken: accessTokenObj.token,
  //   },
  // });
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.APP_PW
    }
  });



  const info = await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
  });

  console.log('Email sent:', info.messageId);
}

module.exports = sendMail;
