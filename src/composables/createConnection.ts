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
export let peerConnection: RTCPeerConnection

async function createPeerConnection(memberId: string) {
    remoteStream = new MediaStream()
    peerConnection = new RTCPeerConnection(servers)

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = event => {
        const stream = event.streams[0]
        stream && stream.getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            agoraClient!.sendMessageToPeer({
                text: JSON.stringify(event.candidate)
            }, memberId)
        }
    }

    return { peerConnection, remoteStream }
}

export async function createAndSendOffer(memberId: string) {
    const { peerConnection } = await createPeerConnection(memberId)

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    await agoraClient!.sendMessageToPeer({
        text: JSON.stringify(offer)
    }, memberId)
}

export async function createAndSendAnswer(memberId: string, offer: RTCSessionDescriptionInit) {
    const { peerConnection } = await createPeerConnection(memberId)

    await peerConnection.setRemoteDescription(offer)

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    agoraClient!.sendMessageToPeer({
        text: JSON.stringify(answer)
    }, memberId)
}

export async function appendAnswer(answer: RTCSessionDescriptionInit) {
    if (!peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(answer)
    }

}