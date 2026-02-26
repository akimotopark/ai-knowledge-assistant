const pool = require('../config/db');

const createDocumentMetaData = async (title, description, userId) => {
    const query = 'INSERT INTO documents (title, description, uploaded_by) VALUES ($1, $2, $3) RETURNING *';
    const values = [title, description, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

module.exports = {
    createDocumentMetaData
}