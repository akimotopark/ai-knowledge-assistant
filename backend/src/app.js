require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const connectMongo = require('./config/mongo');
const initDb = require('./config/initDb');
const authRoutes = require('./routes/authRouth');
const documentRoutes = require('./routes/documentRoutes');
const { authenticate, authorize } = require('./middleware/authMiddleware');
const { connectQueue } = require('./utils/rabbitmq');
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
app.get("/api/admin", authenticate, authorize("admin"), (req, res) => {
    res.status(200).json({ message: "Admin route", user: req.user });
})

//document routes 
app.use('/api/documents', documentRoutes);

// 404 catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

const PORT = process.env.PORT || 5001;

//connect mongo
connectMongo();

//connect rabbitmq
connectQueue();

//connect DB and initialize tables, then start server
pool.connect().then(async () => {
    console.log('Connected to database');
    await initDb();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to connect to database', err);
    process.exit(1);
});