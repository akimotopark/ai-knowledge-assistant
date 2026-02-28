
const pool = require('./src/config/db');
const { publishToQueue } = require('./src/utils/rabbitmq');

async function requeue() {
    try {
        const res = await pool.query("SELECT id FROM documents WHERE status != 'processed'");
        console.log(`Found ${res.rows.length} documents to re-queue`);
        for (const row of res.rows) {
            console.log(`Re-queuing document ${row.id}`);
            await publishToQueue({ documentId: row.id });
        }
        console.log('Finalizing...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

requeue();
