// Replace the setTimeout block in sendMessage() with this:
const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: msg,
        series: currentUniverse, // 'lom' or 'mt'
        audience: currentAudience // 'watcher' or 'reader'
    })
});

// Handle the Streaming Response (SSE)
const reader = response.body.getReader();
const decoder = new TextDecoder();
let oracleText = "";

const oracleDiv = document.createElement('div');
oracleDiv.className = 'message oracle-msg';
oracleDiv.innerHTML = `<div class="chat-bubble"></div>`;
messagesContainer.appendChild(oracleDiv);
const bubble = oracleDiv.querySelector('.chat-bubble');

while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
    
    for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
                oracleText += parsed.content;
                bubble.textContent = oracleText;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        } catch (e) {}
    }
}
