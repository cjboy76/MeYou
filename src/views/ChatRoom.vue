<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect, reactive } from "vue"
import { useUserMedia } from '@vueuse/core'
import { useAgora, createAndSendOffer, createAndSendAnswer, remoteStream, appendAnswer, peerConnection } from '../composables'
import { useRoute, useRouter } from "vue-router";
import ControllerBar from "@/components/ControllerBar.vue";
import type { RtmChannel, RtmClient } from "agora-rtm-sdk";
import { checkRoom, destroyRoom, updateGuest } from "@/service";
import { useUserStore } from "@/stores/useUserStore";
import { toast } from "vue-sonner";

const userStore = useUserStore()

const localCamera = ref<HTMLVideoElement | undefined>()
const remoteCamera = ref<HTMLVideoElement | undefined>()
const streamState = reactive({
    remote: false,
    camera: true,
    voice: true
})
const router = useRouter()
const route = useRoute()
const roomId = route.params.roomid as string
const defaultConstraints = {
    video: {
        width: 1920,
        height: 1080,
        facingMode: "user"
    },
    audio: {
        echoCancellation: {
            exact: true
        }
    }
}

let isHost = false
let channel: RtmChannel
let client: RtmClient

const { stream: localStream, start: getUserMedia, stop: stopUserMedia } = useUserMedia({ constraints: defaultConstraints })

const localCameraWatcher = watchEffect(() => {
    if (!localCamera.value) return

    localCamera.value.srcObject = localStream.value!
})

const remoteCameraWatcher = watchEffect(() => {
    if (!remoteCamera.value || !remoteStream.value) return

    remoteCamera.value.srcObject = remoteStream.value
    streamState.remote = true
})

let connectorId = ''
onMounted(async () => {
    const roomStatus = await checkRoom(roomId)

    if (!roomStatus || roomStatus.guestId) {
        router.replace({ name: 'home' })
        toast("chatroom not available")
        return
    }

    isHost = roomStatus.hostId === userStore.uid

    if (!isHost) updateGuest(roomId, userStore.uid)

    getUserMedia()

    client = await useAgora()
    client.removeAllListeners()
    await client.login({
        uid: userStore.uid
    })
    channel = client.createChannel(roomId)
    await channel.join()

    channel.on("MemberJoined", (memberId: string) => {
        createAndSendOffer(memberId, localStream.value!)
    })
    channel.on('MemberLeft', () => {
        console.log('MemberLeft, via channel listener')
        streamState.remote = false
    })
    client.on("MessageFromPeer", async (message, memberId) => {
        connectorId = memberId
        // @ts-ignore
        const context = JSON.parse(message.text)
        if (context.type === 'offer') {
            createAndSendAnswer(memberId, context, localStream.value!)
        }
        if (context.type === 'answer') {
            appendAnswer(context)
        }
        if (context.type === 'icecandidate') {
            peerConnection.addIceCandidate(context.candidate)
        }
        if (context.type === 'disconnect') {
            console.log('MemberLeft, via RTM')
            streamState.remote = false
        }
    })
    client.on('ConnectionStateChanged', (newState, reason) => {
        console.log({ newState, reason })
    })
})

onUnmounted(async () => {
    await clientDispose()
})

window.addEventListener('beforeunload', clientDispose)

async function clientDispose() {
    stopUserMedia()
    localCameraWatcher && localCameraWatcher()
    remoteCameraWatcher && remoteCameraWatcher()

    if (connectorId) {
        await client!.sendMessageToPeer({
            text: JSON.stringify({
                type: 'disconnect'
            })
        }, connectorId)
    }

    isHost ? await destroyRoom(roomId) : await updateGuest(roomId)

    await channel.leave()
    await client.logout()
}

function toggleCamera() {
    if (!localStream.value) return
    const videoTrack = localStream.value.getTracks().find(track => track.kind === 'video')
    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        streamState.camera = !streamState.camera
    }
}

function toggleVoice() {
    if (!localStream.value) return
    const audioTrack = localStream.value.getTracks().find(track => track.kind === 'audio')
    if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        streamState.voice = !streamState.voice
    }
}
</script>

<template>
    <div class="overflow-hidden h-screen bg-black">
        <video class='video' muted="true" ref="localCamera" autoplay playsinline
            :class="{ smallFrame: streamState.remote }"></video>
        <video class='video' ref="remoteCamera" autoplay playsinline :class="{ 'hidden': !streamState.remote }"></video>

        <ControllerBar :camera-on="streamState.camera" :voice-on="streamState.voice" @close="router.push({ name: 'home' })"
            @toggle-camera="toggleCamera" @toggle-voice="toggleVoice" />
    </div>
</template>