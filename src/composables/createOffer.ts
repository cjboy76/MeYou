const servers: RTCConfiguration = {
    iceServers: [
        {
            urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
            ]
        }
    ]
}


export async function createOffer(localStream: MediaStream) {
    const peerConnection = new RTCPeerConnection(servers)
    const remoteStream = new MediaStream()

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track)
    })

    peerConnection.ontrack = event => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = event => {
        if (event.candidate) console.log(event.candidate)
    }

    return {
        peerConnection,
        remoteStream
    }
}