const pool = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        // 1. Total Documents
        // Admin sees all, user sees only theirs
        let totalDocsQuery = 'SELECT COUNT(*) FROM documents';
        let totalDocsValues = [];
        if (!isAdmin) {
            totalDocsQuery += ' WHERE uploaded_by = $1';
            totalDocsValues = [userId];
        }
        const { rows: totalDocsRows } = await pool.query(totalDocsQuery, totalDocsValues);

        // 2. Recent Uploads (last 7 days)
        let recentDocsQuery = "SELECT COUNT(*) FROM documents WHERE created_at > NOW() - INTERVAL '7 days'";
        let recentDocsValues = [];
        if (!isAdmin) {
            recentDocsQuery += ' AND uploaded_by = $1';
            recentDocsValues = [userId];
        }
        const { rows: recentDocsRows } = await pool.query(recentDocsQuery, recentDocsValues);

        // 3. AI Interactions (Total messages across all user's sessions)
        const aiInteractionsQuery = `
            SELECT COUNT(*) 
            FROM chat_messages m
            JOIN chat_sessions s ON m.session_id = s.id
            WHERE s.user_id = $1
        `;
        const { rows: aiInteractionsRows } = await pool.query(aiInteractionsQuery, [userId]);

        res.status(200).json({
            totalDocuments: parseInt(totalDocsRows[0].count),
            recentUploads: parseInt(recentDocsRows[0].count),
            aiInteractions: parseInt(aiInteractionsRows[0].count)
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};

module.exports = {
    getDashboardStats
};
