const ws = new WebSocket("ws://localhost:8080");

const conn = document.getElementById('connection');
const sendButton = document.getElementById("sendButton");
const message = document.getElementById("message");
const personId = document.getElementById("id");
const sendBtn = document.getElementById("sendBtn");
const chat = document.getElementById("chat");

ws.onmessage = (message) => {
    console.log(JSON.parse(message.data));
    conn.innerHTML = JSON.parse(message.data).id;
    chat.innerHTML = JSON.parse(message.data).message;
}

sendButton.addEventListener('click', (e) => {
    ws.send(JSON.stringify({
        id: conn.innerHTML.toString(),
        message: `Hi I am Subhajit, id - ${conn.innerHTML}`
    }))
})

sendBtn.addEventListener('click', (e) => {
    ws.send(JSON.stringify({
        id: personId.value,
        message: message.value,
    }))
})