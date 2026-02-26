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
    // Add more tables here, e.g.:
    // {
    //     name: 'tags',
    //     sql: `
    //         CREATE TABLE IF NOT EXISTS tags (
    //             id SERIAL PRIMARY KEY,
    //             name VARCHAR(100) UNIQUE NOT NULL
    //         );
    //     `,
    // },
];

const initDb = async () => {
    try {
        for (const table of tables) {
            await pool.query(table.sql);
            console.log(`  ✔ Table "${table.name}" is ready`);
        }
        console.log('Database tables initialized');
    } catch (error) {
        console.error('Failed to initialize database tables:', error);
        process.exit(1);
    }
};

module.exports = initDb;
