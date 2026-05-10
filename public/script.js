const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let chatHistory = [];

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
});

// Add message to UI
function addMessage(text, role) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${role}-message`);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    // Use marked for model messages (to support markdown/bold/lists)
    if (role === 'model') {
        contentDiv.innerHTML = marked.parse(text);
    } else {
        contentDiv.textContent = text;
    }
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send message to API
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // UI Updates
    addMessage(text, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Add "Typing..." placeholder
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'model-message', 'typing');
    typingDiv.innerHTML = '<div class="message-content">Menulis pesan...</div>';
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: text,
                history: chatHistory
            })
        });

        const data = await response.json();
        
        // Remove typing indicator
        chatContainer.removeChild(typingDiv);

        if (data.error) {
            addMessage('Maaf, ada kendala koneksi. Coba lagi ya?', 'model');
        } else {
            addMessage(data.response, 'model');
            // Update history for context
            chatHistory.push({ role: 'user', text: text });
            chatHistory.push({ role: 'model', text: data.response });
        }
    } catch (error) {
        console.error('Error:', error);
        chatContainer.removeChild(typingDiv);
        addMessage('Sepertinya ada kesalahan teknis. Mohon tunggu sebentar.', 'model');
    }
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
