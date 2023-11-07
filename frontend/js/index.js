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

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const camOn = document.getElementById("camOn");
const camOff = document.getElementById("camOff");

const placeCall = document.getElementById("placeCall");

let conf = {
    video: true,
    audio: true
}

let localStream;


const initCall = () => {
    const iceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
    ];
    const configuration = { iceServers };
    let peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    return peerConnection;
}

camOn.addEventListener('click', async(e) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(conf);
        localVideo.srcObject = stream;
        localStream = stream;
        localVideo.style.display = 'block';
        camOn.style.display = 'none'
        camOff.style.display = 'block'
    } catch (e) {
        console.log(e)
    }
})



camOff.addEventListener('click', async(e) => {
    try {
        localStream.getTracks().forEach((track) => {
            track.enabled = false;
        })
        localVideo.style.display = 'none';
        camOn.style.display = 'block'
        camOff.style.display = 'hidden'

    } catch (e) {
        console.log(e)
    }
})

placeCall.addEventListener('click', async(e) => {
    const peer = initCall();
    console.log(peer)

    peer.createOffer()
        .then(offer => {
            // Set the local description to the offer
            return peer.setLocalDescription(offer);
        })
        .then(() => {
            // The SDP offer is now in the localDescription property
            const sdpOffer = peer.localDescription;
            console.log(sdpOffer);
            // Send the SDP offer to the remote peer via WebSocket
            ws.send(JSON.stringify({
                id: personId.value,
                sdpOffer
            }));
        })
        .catch(error => {
            console.error('Error creating SDP offer:', error);
        });
})