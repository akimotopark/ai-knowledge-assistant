const {
    createSession,
    getSessionsByUser,
    getSessionById,
    deleteSession,
    updateSessionTitle,
    touchSession,
    createMessage,
    getMessagesBySession
} = require('../models/chatModel');
const { chroma, geminiEmbeddingModel, geminiLanguageModel } = require("../utils/aiClient");

// --- Sessions ---
const getSessions = async (req, res) => {
    try {
        const sessions = await getSessionsByUser(req.user.id);
        res.status(200).json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Failed to fetch sessions' });
    }
};

const createNewSession = async (req, res) => {
    try {
        const { title } = req.body;
        const sessionTitle = title || "New Chat";
        const session = await createSession(req.user.id, sessionTitle);
        res.status(201).json(session);
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ message: 'Failed to create session' });
    }
};

const removeSession = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteSession(id, req.user.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Session not found or not authorized' });
        }
        res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ message: 'Failed to delete session' });
    }
};

// --- Messages & RAG ---
const getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify ownership
        const session = await getSessionById(id, req.user.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        
        const messages = await getMessagesBySession(id);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

async function generateQueryEmbedding(question) {
    const result = await geminiEmbeddingModel.embedContent({
        content: { parts: [{ text: question }] },
        taskType: "RETRIEVAL_QUERY",
    });
    return result.embedding.values;
}

const sendMessage = async (req, res) => {
    try {
        const { id: sessionId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Message content is required" });
        }

        // Verify session ownership
        const session = await getSessionById(sessionId, req.user.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // 1. Save user's message to DB
        const userMsg = await createMessage(sessionId, 'user', content);

        // 2. Fetch history for context
        const messageHistory = await getMessagesBySession(sessionId);
        
        // Format history for the prompt
        let historyPrompt = "";
        if (messageHistory.length > 1) { // more than just the current message
            historyPrompt = "\n\nPast Chat Context:\n";
            messageHistory.slice(0, -1).forEach(m => {
                historyPrompt += `[${m.role.toUpperCase()}]: ${m.content}\n`;
            });
        }

        // Auto-update session title if it's the very first message
        if (session.title === "New Chat" && messageHistory.length === 1) {
            const shortTitle = content.substring(0, 30) + (content.length > 30 ? "..." : "");
            await updateSessionTitle(sessionId, req.user.id, shortTitle);
        } else {
            await touchSession(sessionId); // bump updated_at
        }

        // 3. RAG Retrieval via ChromaDB
        let context = "";
        try {
            const queryEmbedding = await generateQueryEmbedding(content);
            const collection = await chroma.getOrCreateCollection({ name: "documents" });
            
            // Check if collection has data before querying
            const count = await collection.count();
            if (count > 0) {
                const results = await collection.query({
                    queryEmbeddings: [queryEmbedding],
                    nResults: 5
                });
                const retrievedDocs = results.documents[0] || [];
                context = retrievedDocs.join("\n\n");
            }
        } catch (err) {
            console.warn("ChromaDB retrieval failed (might be empty or down):", err.message);
        }

        // 4. Construct Prompt & Call Gemini
        const prompt = `
        You are an enterprise knowledge assistant. You help users answer questions based on the provided Knowledge Base Context.
        Use the conversation history if it's relevant to the current question. 
        If you don't know the answer from the context, you can just be helpful.

        ${historyPrompt}

        Knowledge Base Context: 
        ${context ? context : "No documents available right now."}
        
        Current User Question: ${content}
        Assistant Answer: 
        `;

        const result = await geminiLanguageModel.generateContent(prompt);
        const answer = result.response.text();

        // 5. Save and return assistant's response
        const assistantMsg = await createMessage(sessionId, 'assistant', answer);
        
        return res.json({ 
            userMessage: userMsg,
            assistantMessage: assistantMsg 
        });

    } catch (error) {
        console.error("Error processing chat message:", error);
        return res.status(500).json({ error: "Failed to process chat message" });
    }
};

module.exports = {
    getSessions,
    createNewSession,
    removeSession,
    getMessages,
    sendMessage
};
