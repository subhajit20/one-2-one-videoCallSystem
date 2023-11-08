const ws = new WebSocket("ws://localhost:8080");

const conn = document.getElementById('connection');
const sendButton = document.getElementById("sendButton");
const message = document.getElementById("message");
const personId = document.getElementById("id");
const sendBtn = document.getElementById("sendBtn");
const chat = document.getElementById("chat");
const ring = document.getElementById("ring");

let offer;
let answer;
let localStream;
let peerConnection;

const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
];
const configuration = { iceServers };
peerConnection = new RTCPeerConnection(configuration);

ws.onmessage = async(message) => {
    const incommingData = JSON.parse(message.data);
    if (incommingData.sdpOffer) {
        const sdpOffer = JSON.parse(message.data).sdpOffer;
        if (sdpOffer.type === 'offer') {
            offer = sdpOffer
            console.log(sdpOffer)
            ring.innerHTML += `<div style="font-size:2rem;color:red" role="alert">
            Someone calling you...
            </div>`
        }
    } else if (incommingData.sdpAnswer) {
        answer = JSON.parse(message.data).sdpAnswer
        console.log(answer)
        ring.innerHTML += `<div style="font-size:2rem;color:red" role="alert">
        Accepted the call...
        </div>`;

        const remoteDesc = new RTCSessionDescription(answer);
        try {
            await peerConnection.setRemoteDescription(remoteDesc);
        } catch (e) {
            console.log(e)
        }
    } else if (incommingData.iceCandidate) {
        try {
            console.log(incommingData);
            await peerConnection.addIceCandidate(incommingData.iceCandidate);
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    } else {
        console.log(JSON.parse(message.data));
        conn.innerHTML = JSON.parse(message.data).id;
        chat.innerHTML = JSON.parse(message.data).message;

    }
}

peerConnection.addEventListener('connectionstatechange', event => {
    if (peerConnection.connectionState === 'connected') {
        console.log(peerConnection)
    }
});

peerConnection.addEventListener('icecandidate', event => {
    if (event.candidate) {
        console.log(event.candidate)
        ws.send(JSON.stringify({
            id: personId.value,
            'new-ice-candidate': event.candidate,
        }));
    }
});
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

peerConnection.addEventListener('track', async(event) => {
    const streams = event.streams;
    streams.forEach((stream) => {
        remoteVideo.style.display = 'block';
        remoteVideo.srcObject = stream;
    })
});


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


const camOn = document.getElementById("camOn");
const camOff = document.getElementById("camOff");

const placeCall = document.getElementById("placeCall");
const receiveCall = document.getElementById("receiveCall");

let conf = {
    video: true,
    audio: true
}

const createPeer = () => {
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
    try {
        peerConnection = createPeer();
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer)
        const sdpOffer = peerConnection.localDescription;

        ws.send(JSON.stringify({
            id: personId.value,
            sdpOffer
        }));
    } catch (e) {
        console.log(e)
    }
})

receiveCall.addEventListener('click', async(e) => {
    try {
        peerConnection = createPeer();
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        ws.send(JSON.stringify({
            id: personId.value,
            answer
        }));
    } catch (e) {
        console.log(e)
    }
})