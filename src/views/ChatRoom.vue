<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watchEffect, reactive, computed } from "vue"
import { useUserMedia, useShare, useClipboard } from '@vueuse/core'
import { useAgoraClient, createAndSendOffer, createAndSendAnswer, remoteStream, appendAnswer, peerConnection } from '../composables'
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
        width: 600,
        height: 800,
        facingMode: "user"
    },
    audio: {
        echoCancellation: {
            exact: true
        }
    }
}

const channel = ref<RtmChannel>()
let isHost = false
let connectorId = ''

const { stream: localStream, start: getUserMedia, stop: stopUserMedia } = useUserMedia({ constraints: defaultConstraints })
const { agoraClient, agoraCreate, agoraDispose } = useAgoraClient(userStore.uid)

const localRatio = computed(() => {
    if (!localStream.value) return 1
    return localStream.value.getVideoTracks()[0].getSettings().aspectRatio
})

const localCameraWatcher = watchEffect(() => {
    if (!localCamera.value) return

    localCamera.value.srcObject = localStream.value!
})

const remoteCameraWatcher = watchEffect(() => {
    if (!remoteCamera.value || !remoteStream.value) return
    console.log(remoteCamera.value, remoteStream.value)
    remoteCamera.value.srcObject = remoteStream.value
    streamState.remote = true
})

const channelWatcher = watchEffect(async () => {
    if (!agoraClient.value || channel.value) return

    channel.value = agoraClient.value.createChannel(roomId)

    await channel.value.join()

    channel.value.on("MemberJoined", (memberId: string) => {
        createAndSendOffer(memberId, localStream.value!)
    })
    channel.value.on('MemberLeft', () => {
        console.log('MemberLeft, via channel listener')
        streamState.remote = false
    })
})

const clientWatcher = watchEffect(() => {
    if (!agoraClient.value) return

    agoraClient.value.on("MessageFromPeer", async (message, memberId) => {
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
    agoraClient.value.on('ConnectionStateChanged', (newState, reason) => {
        console.log({ newState, reason })
    })
})

onMounted(async () => {
    agoraCreate()
    const roomStatus = await checkRoom(roomId)

    if (!roomStatus || roomStatus.guestId) {
        router.replace({ name: 'home' })
        toast("chatroom not available")
        return
    }

    isHost = roomStatus.hostId === userStore.uid

    if (!isHost) updateGuest(roomId, userStore.uid)

    getUserMedia()
})

onBeforeUnmount(async () => {
    await clientDispose()
})

window.addEventListener('beforeunload', clientDispose)

async function clientDispose() {
    remoteStream.value = undefined
    stopUserMedia()

    localCameraWatcher && localCameraWatcher()
    remoteCameraWatcher && remoteCameraWatcher()
    channelWatcher && channelWatcher()
    clientWatcher && clientWatcher()

    if (connectorId) {
        await agoraClient.value!.sendMessageToPeer({
            text: JSON.stringify({
                type: 'disconnect'
            })
        }, connectorId)
    }

    isHost ? await destroyRoom(roomId) : await updateGuest(roomId)

    if (channel.value) await channel.value.leave()
    agoraDispose()
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

const { share, isSupported: shareSupported } = useShare()
const { copy, isSupported: copySupported } = useClipboard()

async function shareHandler() {
    if (shareSupported.value) {
        await share({
            title: 'MeYou',
            text: 'Video Calling application',
            url: location.href,
        })
        return
    }

    if (copySupported.value) {
        try {
            await copy(location.href)
            toast('url copied!')
        } catch {
            toast('url copy failed.')
        }
    }
}
</script>

<template>
    <div class="overflow-hidden h-screen bg-black">
        <video class='video localVideo' muted="true" ref="localCamera" autoplay playsinline
            :class="{ smallFrame: streamState.remote }" :style="{ '--aspect-ratio': localRatio }"></video>
        <video class='video' ref="remoteCamera" autoplay playsinline :class="{ 'hidden': !streamState.remote }"></video>

        <ControllerBar :camera-on="streamState.camera" :voice-on="streamState.voice" @close="router.push({ name: 'home' })"
            @share="shareHandler" @toggle-camera="toggleCamera" @toggle-voice="toggleVoice" />
    </div>
</template>

<style>
/* .ratio {
    padding-bottom: calc(100% / var(--aspect-ratio));
} */

@media (max-width: 768px) {
    .localVideo {
        width: 100%;
        /* Full width in mobile view */
        height: auto;
        /* Allow height to adjust based on aspect ratio */
        aspect-ratio: calc(1/var(--aspect-ratio));
    }
}
</style>