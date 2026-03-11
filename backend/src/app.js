require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const connectMongo = require('./config/mongo');
const initDb = require('./config/initDb');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const { authenticate, authorize } = require('./middleware/authMiddleware');
const { connectQueue } = require('./utils/rabbitmq');
const ragRoutes = require('./routes/ragRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();

app.use(cors());
app.use(express.json());


//basic routes
app.get('/', (req, res) => {
    res.status(200).json({ message: 'AI Knowledge Assistant API', version: '1.0.0' });
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

//auth routes
app.use('/api/auth', authRoutes);
app.get('/api/protected', authenticate, (req, res) => {
    res.status(200).json({ message: 'Protected route', user: req.user });
});
// (adminRoutes handles this path now)

//document routes 
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);

//rag routes
app.use('/api/rag', ragRoutes);

// 404 catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

const PORT = process.env.PORT || 5001;

//connect mongo
connectMongo();

async function startServer() {
    const maxRetries = 10;
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await pool.connect();
            console.log('Connected to database');
            await initDb();
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
            connectQueue();
            return;
        } catch (err) {
            retries++;
            console.error(`Failed to connect to database (attempt ${retries}/${maxRetries}):`, err.message);
            if (retries >= maxRetries) process.exit(1);
            await new Promise(res => setTimeout(res, 3000));
        }
    }
}
startServer();