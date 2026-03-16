const provider = process.env.LLM_PROVIDER || 'gemini'; // gemini | openai | ollama

let llm;

try {
    if (provider === 'gemini') {
        llm = require('./providers/gemini');
    } else if (provider === 'openai') {
        llm = require('./providers/openai');
    } else if (provider === 'ollama') {
        llm = require('./providers/ollama');
    } else {
        console.warn(`Unknown LLM_PROVIDER: ${provider}. Falling back to Gemini.`);
        llm = require('./providers/gemini');
    }
} catch (error) {
    console.error(`Error loading LLM provider ${provider}:`, error);
    // Fallback to gemini if possible to avoid crash, or rethrow
    llm = require('./providers/gemini');
}

module.exports = llm;
