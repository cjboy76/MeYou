import { agoraClient } from "."
import { ref } from "vue"

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

export const remoteStream = ref<MediaStream>()
export let peerConnection: RTCPeerConnection

async function createPeerConnection(memberId: string, localStream: MediaStream) {
    remoteStream.value = new MediaStream()
    peerConnection = new RTCPeerConnection(servers)

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = event => {
        const stream = event.streams[0]

        stream && stream.getTracks().forEach(track => {
            remoteStream.value!.addTrack(track)
        })
    }

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            agoraClient!.sendMessageToPeer({
                text: JSON.stringify({ candidate: event.candidate, type: "icecandidate" })
            }, memberId)
        }
    }

    return { peerConnection }
}

export async function createAndSendOffer(memberId: string, localStream: MediaStream) {
    await createPeerConnection(memberId, localStream)

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    await agoraClient!.sendMessageToPeer({
        text: JSON.stringify(offer)
    }, memberId)
}

export async function createAndSendAnswer(memberId: string, offer: RTCSessionDescriptionInit, localStream: MediaStream) {
    await createPeerConnection(memberId, localStream)

    await peerConnection.setRemoteDescription(offer)

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    agoraClient!.sendMessageToPeer({
        text: JSON.stringify(answer)
    }, memberId)
}

export function appendAnswer(answer: RTCSessionDescriptionInit) {
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer)
    }

}