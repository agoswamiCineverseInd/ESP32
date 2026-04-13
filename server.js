const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Index.html'));
});

let temperature = 0;
let clients = [];
let sensorData = {
    x: 0,
    y: 0,
    z: 0
};

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

app.get('/api/change', (req, res) => {
     const { temp, x, y, z } = req.query;
    temperature = Number(temp) || 0;
    sensorData["x"] =  Number(x) || 0;
    sensorData["y"] =  Number(y) || 0
    sensorData["z"] =  Number(z) || 0;
    sendUpdate();
    res.json({ "temperature":temperature,"sensorData":sensorData });
});

function sendUpdate() {
    clients.forEach(client => {
        client.res.write(`data: ${JSON.stringify({ "temperature":temperature,"sensorData":sensorData })}\n\n`);
    });
}

function generateRandomData() {
    temperature = Number((20 + Math.random() * 20).toFixed(2)); // 20°C → 40°C

    sensorData.x = (Math.random() * 2 - 1).toFixed(2); // -1 to 1
    sensorData.y = (Math.random() * 2 - 1).toFixed(2);
    sensorData.z = (Math.random() * 2 - 1).toFixed(2);
}

// setInterval(() => {
//     generateRandomData();   
//     sendUpdate();
//     console.log("working")         
// }, 2000);

setInterval(() => {
    clients.forEach(client => {
        client.res.write(`: keep-alive\n\n`);
    });
}, 25000);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// =======================================**************************=================================