const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function checkAvailableModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Menggunakan library v1 (bukan beta) jika memungkinkan
        console.log("Mengambil daftar model yang tersedia untuk API Key Anda...");
        
        // Cara manual fetch untuk melihat respon asli jika SDK bermasalah
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        if (data.models) {
            console.log("--- MODEL YANG TERSEDIA ---");
            data.models.forEach(m => {
                console.log(`- ${m.name.replace('models/', '')}`);
            });
            console.log("---------------------------");
            console.log("Saran: Gunakan salah satu nama di atas pada index.js");
        } else {
            console.log("Gagal mengambil daftar model. Respon API:", JSON.stringify(data));
        }
    } catch (error) {
        console.error("Gagal total:", error.message);
    }
}

checkAvailableModels();
