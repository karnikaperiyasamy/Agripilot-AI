requireAuth();

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        addMessage(data.reply || getFallbackResponse(message), 'bot');
    } catch (error) {
        addMessage(getFallbackResponse(message), 'bot');
    } finally {
        hideLoading();
    }
}

function addMessage(text, sender) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function getFallbackResponse(message) {
    const msg = message.toLowerCase();
    if (msg.includes('crop')) return "Based on current season, consider planting rice, wheat, or maize. Ensure proper soil preparation and irrigation.";
    if (msg.includes('fertilizer')) return "Use organic compost and NPK fertilizers. Apply DAP during planting and urea after 30 days.";
    if (msg.includes('disease')) return "Monitor crops regularly. Use neem oil for pest control. Remove infected plants to prevent spread.";
    if (msg.includes('profit')) return "To maximize profits: reduce input costs, diversify crops, practice direct selling, and monitor market prices.";
    if (msg.includes('irrigation')) return "Use drip irrigation for water efficiency. Water early morning or evening. Adjust schedule based on rainfall.";
    if (msg.includes('scheme')) return "Check PM-KISAN, Soil Health Card, and Fasal Bima Yojana schemes for farmer benefits.";
    return "I'm your farming assistant. Ask me about crops, fertilizers, irrigation, disease control, profit optimization, or government schemes!";
}

window.sendMessage = sendMessage;

document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});