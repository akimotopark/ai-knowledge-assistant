const pool = require('../config/db');

// --- Sessions ---
const createSession = async (userId, title) => {
    const query = 'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING *';
    const values = [userId, title];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const getSessionsByUser = async (userId) => {
    const query = 'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC';
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows;
};

const getSessionById = async (sessionId, userId) => {
    const query = 'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2';
    const values = [sessionId, userId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const deleteSession = async (sessionId, userId) => {
    const query = 'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING *';
    const values = [sessionId, userId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const updateSessionTitle = async (sessionId, userId, title) => {
    const query = 'UPDATE chat_sessions SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *';
    const values = [title, sessionId, userId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const touchSession = async (sessionId) => {
    const query = 'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    await pool.query(query, [sessionId]);
}


// --- Messages ---
const createMessage = async (sessionId, role, content) => {
    const query = 'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING *';
    const values = [sessionId, role, content];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const getMessagesBySession = async (sessionId) => {
    const query = 'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC';
    const values = [sessionId];
    const { rows } = await pool.query(query, values);
    return rows;
};

module.exports = {
    createSession,
    getSessionsByUser,
    getSessionById,
    deleteSession,
    updateSessionTitle,
    touchSession,
    createMessage,
    getMessagesBySession
};
