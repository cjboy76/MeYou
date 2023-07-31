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
        width: { min: 640, ideal: window.screen.width * window.devicePixelRatio, max: 1920 },
        height: { min: 480, ideal: window.screen.height * window.devicePixelRatio, max: 1080 },
        facingMode: "user"
    },
    audio: true
}

let isHost = false
let channel: RtmChannel
let client: RtmClient

const { stream: localStream, start: getUserMedia, stop: stopUserMedia } = useUserMedia({ constraints: defaultConstraints })

const cameraWatcher = watchEffect(() => {
    if (localCamera.value) {
        localCamera.value.srcObject = localStream.value!
    }
})

onMounted(async () => {
    const roomStatus = await checkRoom(roomId)

    if (!roomStatus || roomStatus.guestId) {
        router.push({ name: 'home' })
        toast("chatroom not available")
        return
    }

    isHost = roomStatus.hostId === userStore.uid

    if (!isHost) updateGuest(roomId, userStore.uid)

    getUserMedia()

    client = await useAgora()
    channel = client.createChannel(roomId)
    await channel.join()

    channel.on("MemberJoined", (memberId: string) => {
        createAndSendOffer(memberId, localStream.value!)
        remoteCamera.value!.srcObject = remoteStream
    })
    channel.on('MemberLeft', () => {
        streamState.remote = false
    })
    client.on("MessageFromPeer", async (message, memberId) => {
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
        remoteCamera.value!.srcObject = remoteStream
        streamState.remote = true
    })
})

onUnmounted(() => {
    cameraWatcher && cameraWatcher()

    isHost ? destroyRoom(roomId) : updateGuest(roomId)

    agoraDispose()
})

async function agoraDispose() {
    stopUserMedia()
    channel && channel.leave()
    client && client.logout()
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