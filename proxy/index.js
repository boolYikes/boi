const sendMail = require("./utils");
const express = require("express");
const cors = require("cors");

const environment = process.env.EXC_ENV || 'dev';
environment === 'dev' && require('dotenv').config();

app = express()
app.use(cors())
app.use(express.json())

// Routes
app.post('/send', async (req, res) => {
    const { to, subject, text } = req.body;
    try {
        await sendMail({ to, subject, text });
        res.status(200).json({ message: 'Mail sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.listen(process.env.PORT, () => console.log(`Mail proxy running on port ${process.env.PORT}`));