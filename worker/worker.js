require('dotenv').config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const DocumentContent = require('./models/documentContent');

//postgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

//mongo
mongoose.connect(process.env.MONGO_URI);


async function startWorker() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('document_queue', { durable: true });
    console.log("worker waiting for the message ....");

    channel.consume('document_queue', async (msg) => {
        const { documentId } = JSON.parse(msg.content.toString());

        console.log(`Processing document ${documentId}`);

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Update status
        await pool.query(
            "UPDATE documents SET status='processed' WHERE id=\$1",
            [documentId]
        );

        channel.ack(msg);
    })
}

startWorker();