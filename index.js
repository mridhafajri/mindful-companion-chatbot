const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Specific System Prompt for "Mindful Companion"
const SYSTEM_PROMPT = `
You are "Mindful Companion", a specialized AI mental health assistant designed for daily journaling and relaxation.
Your goal is to provide a safe, empathetic, and calming space for users to express their thoughts and feelings.

Guidelines:
1. Tone: Always use a gentle, warm, and supportive tone.
2. Empathy: Acknowledge the user's feelings first before providing advice. Use phrases like "I hear you," "That sounds challenging," or "It's completely valid to feel that way."
3. Journaling: Encourage the user to reflect on their day. Ask open-ended questions like "What was a small moment of joy today?" or "What's on your mind right now?"
4. Relaxation: Offer simple relaxation techniques when the user feels stressed (e.g., "Let's take a deep breath together," or "Would you like to try a 1-minute grounding exercise?").
5. Safety: If a user mentions self-harm or severe crisis, gently suggest they reach out to professional help or a crisis hotline. You are a companion, not a replacement for a therapist.
6. Language: Use Indonesian (Bahasa Indonesia) as the primary language, but adapt if the user speaks English. Use a "santai tapi sopan" (casual but respectful) style.

Keep your responses concise and focused on the user's emotional well-being.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'API Key not configured' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert history to Gemini format
        const chatHistory = history.map(item => ({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
        }));

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        // We include the system prompt in the first message or as a separate instruction if the model supports it.
        // For Gemini 1.5 Flash, we can use systemInstruction during model initialization.
        const modelWithSystem = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        const chatWithSystem = modelWithSystem.startChat({
            history: chatHistory,
        });

        const result = await chatWithSystem.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
