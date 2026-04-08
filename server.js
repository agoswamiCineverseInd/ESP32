const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

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
    const newClient = {
        id: clientId,
        res
    };
    clients.push(newClient);
    console.log("newClient")
    res.write(`data: ${JSON.stringify({ temperature })}\n\n`);
    req.on('close', () => {
        clients = clients.filter(c => c.id !== clientId);
    });
});


app.get('/api/increase/:temp', (req, res) => {
    const temp = Number(req.params.temp) || 0;
    temperature=temp;
    sendTemperatureUpdate();
    res.json({ temperature });
});


app.get('/api/decrease/:temp', (req, res) => {
    const temp = Number(req.params.temp) || 0;
    temperature=temp;
    sendTemperatureUpdate();
    res.json({ temperature });
});

function sendTemperatureUpdate() {
    clients.forEach(client => {
        client.res.write(`data: ${JSON.stringify({ temperature })}\n\n`);
    });
}

function testTemp() {
    let curtemp = Math.floor(Math.random() * 30) + 15;
    temperature = curtemp;
    sendTemperatureUpdate();
}

setInterval(() => {
    clients.forEach(client => {
        client.res.write(`: keep-alive\n\n`);
    });
}, 25000);

setInterval(()=>{
    testTemp()
},2000)

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});