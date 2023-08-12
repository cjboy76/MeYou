import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAgoraClient } from '@/composables/useAgoraClient'

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

export const useConnectStore = defineStore('connect', () => {
    const remoteStream = ref<MediaStream>(new MediaStream())
    const peerConnection = ref<RTCPeerConnection>(new RTCPeerConnection(servers))
    const { agoraClient } = useAgoraClient()

    async function createPeerConnection(memberId: string, localStream: MediaStream) {
        remoteStream.value = new MediaStream()
        peerConnection.value = new RTCPeerConnection(servers)

        localStream.getTracks().forEach(track => {
            peerConnection.value.addTrack(track, localStream)
        })
        // Expose peerConnection
        peerConnection.value.ontrack = event => {
            const stream = event.streams[0]

            stream && stream.getTracks().forEach(track => {
                remoteStream.value!.addTrack(track)
            })
        }

        peerConnection.value.onicecandidate = event => {
            if (agoraClient.value && event.candidate) {
                agoraClient.value.sendMessageToPeer({
                    text: JSON.stringify({ candidate: event.candidate, type: "icecandidate" })
                }, memberId)
            }
        }

        return { peerConnection }
    }

    async function createAndSendOffer(memberId: string, localStream: MediaStream) {
        await createPeerConnection(memberId, localStream)

        const offer = await peerConnection.value.createOffer()
        await peerConnection.value.setLocalDescription(offer)
        if (!agoraClient.value) throw new Error('agoraClient not exist.')
        await agoraClient.value.sendMessageToPeer({
            text: JSON.stringify(offer)
        }, memberId)
    }

    async function createAndSendAnswer(memberId: string, offer: RTCSessionDescriptionInit, localStream: MediaStream) {
        await createPeerConnection(memberId, localStream)

        await peerConnection.value.setRemoteDescription(offer)

        const answer = await peerConnection.value.createAnswer()
        await peerConnection.value.setLocalDescription(answer)
        if (!agoraClient.value) throw new Error('agoraClient not exist.')

        agoraClient.value.sendMessageToPeer({
            text: JSON.stringify(answer)
        }, memberId)
    }

    function appendAnswer(answer: RTCSessionDescriptionInit) {
        if (!peerConnection.value.currentRemoteDescription) {
            peerConnection.value.setRemoteDescription(answer)
        }

    }

    return {
        remoteStream: remoteStream,
        peerConnection: peerConnection,
        createAndSendOffer,
        createAndSendAnswer,
        appendAnswer
    }
})
