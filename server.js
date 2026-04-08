const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ THIS FIXES YOUR ISSUE
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let temperature = 0;
let clients = [];

app.get('/api/temp', (req, res) => {
    res.json({ temperature });
});

app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    clients.push({ id: clientId, res });

    res.write(`data: ${JSON.stringify({ temperature })}\n\n`);

    req.on('close', () => {
        clients = clients.filter(c => c.id !== clientId);
    });
});

app.get('/api/change/:temp', (req, res) => {
    temperature = Number(req.params.temp) || 0;
    sendTemperatureUpdate();
    res.json({ temperature });
});

function sendTemperatureUpdate() {
    clients.forEach(client => {
        client.res.write(`data: ${JSON.stringify({ temperature })}\n\n`);
    });
}

setInterval(() => {
    clients.forEach(client => {
        client.res.write(`: keep-alive\n\n`);
    });
}, 25000);

setInterval(() => {
    temperature = Math.floor(Math.random() * 30) + 15;
    sendTemperatureUpdate();
}, 2000);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});