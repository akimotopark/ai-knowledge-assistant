require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

//connect DB
pool.connect().then(() => {
    console.log('Connected to database');
}).catch((err) => {
    console.error('Failed to connect to database', err);
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'AI Knowledge Assistant API', version: '1.0.0' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// 404 catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

const PORT = process.env.PORT || 5001;



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});