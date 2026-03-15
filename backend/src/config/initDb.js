const pool = require('./db');

/**
 * To add a new table:
 * 1. Add a new object to the `tables` array below.
 * 2. Make sure tables with foreign keys come AFTER the tables they reference.
 */
const tables = [
    {
        name: 'users',
        sql: `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `,
    },
    {
        name: 'documents',
        sql: `
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                uploaded_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `,
    },
    {
        name: 'chat_sessions',
        sql: `
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `,
    },
    {
        name: 'chat_messages',
        sql: `
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
                role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `,
    },
];

const initDb = async () => {
    try {
        for (const table of tables) {
            await pool.query(table.sql);
            console.log(`  ✔ Table "${table.name}" checked/created`);
        }

        // 🛠️ Migration: Ensure status and processed_at exist in documents
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='status') THEN
                    ALTER TABLE documents ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='processed_at') THEN
                    ALTER TABLE documents ADD COLUMN processed_at TIMESTAMP;
                END IF;
            END $$;
        `);
        console.log('  ✔ Table "documents" migrations applied');

        console.log('Database tables initialized');
    } catch (error) {
        console.error('Failed to initialize database tables:', error);
        process.exit(1);
    }
};

module.exports = initDb;
