const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(cors({
    origin: 'http://localhost:8080',
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/test', (req, res) => {
    res.json({ message: 'Hello World' });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (data) => {
        // Ensure data is in JSON format
        try {
            const parsedData = JSON.parse(data);
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(parsedData));
                }
            });
        } catch (error) {
            console.error('Error parsing data:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
