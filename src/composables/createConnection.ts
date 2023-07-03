import { agoraClient, localStream } from "."

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

export let remoteStream: MediaStream

async function createPeerConnection(memberId: string) {
    if (!remoteStream) remoteStream = new MediaStream()
    const peerConnection = new RTCPeerConnection(servers)

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track)
    })

    peerConnection.ontrack = event => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            agoraClient.sendMessageToPeer({
                text: JSON.stringify(event.candidate)
            }, memberId)
        }
    }

    return { peerConnection, remoteStream }
}


export async function createAndSendOffer(memberId: string) {
    const { peerConnection, remoteStream } = await createPeerConnection(memberId)

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    agoraClient.sendMessageToPeer({
        text: JSON.stringify(offer)
    }, memberId)

    return {
        remoteStream
    }
}

export async function createAndSendAnswer(memberId: string, offer: RTCSessionDescriptionInit) {
    const { peerConnection, remoteStream } = await createPeerConnection(memberId)

    await peerConnection.setRemoteDescription(offer)

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    agoraClient.sendMessageToPeer({
        text: JSON.stringify(answer)
    }, memberId)

    return {
        remoteStream
    }
}