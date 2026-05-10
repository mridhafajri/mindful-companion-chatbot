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

const SYSTEM_PROMPT = `
Anda adalah "Mindful Companion", asisten kesehatan mental AI yang empatik.
Gunakan Bahasa Indonesia yang menenangkan. Fokus pada journaling dan relaksasi.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // Menggunakan Gemini 3.1 Flash Lite (Terbaru & Gratis)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite",
            systemInstruction: SYSTEM_PROMPT
        });

        const chatHistory = (history || []).map(item => ({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
        }));

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        
        res.json({ response: response.text() });
    } catch (error) {
        console.error('Error detail:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
