const pool = require('../config/db');

const createDocumentMetaData = async (title, description, userId) => {
    const query = 'INSERT INTO documents (title, description, uploaded_by) VALUES ($1, $2, $3) RETURNING *';
    const values = [title, description, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

const getAllDocuments = async () => {
    const { rows } = await pool.query(`
        SELECT d.id, d.title, d.description, d.status, d.created_at,
               u.name as uploaded_by
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        ORDER BY d.created_at DESC
    `);

    return rows;
};

module.exports = {
    createDocumentMetaData,
    getAllDocuments
}