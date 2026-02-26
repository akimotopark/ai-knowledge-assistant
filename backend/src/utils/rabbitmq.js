const amqp = require('amqplib');

let channel;

const connectQueue = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('document_queue', { durable: true });
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}


const publishToQueue = async (message) => {
    try {
        if (!channel) {
            await connectQueue();
        }
        channel.sendToQueue('document_queue', Buffer.from(message));
    } catch (error) {
        console.error('Error publishing to RabbitMQ:', error);
    }
}


module.exports = {
    connectQueue,
    publishToQueue
}