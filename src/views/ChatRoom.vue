<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from "vue"
import { useUserMedia } from '@vueuse/core'
import { useAgora, createAndSendOffer, createAndSendAnswer, remoteStream, appendAnswer, peerConnection } from '../composables'
import { useRoute } from "vue-router";
import ControllerBar from "@/components/ControllerBar.vue";
import { GuidanceNoNoise, GuidanceNoVideo, GuidanceVideo, GuidanceVolume, GuidancePhone } from "@/icons";
import type { RtmChannel, RtmClient } from "agora-rtm-sdk";

const localCamera = ref<HTMLVideoElement | undefined>()
const remoteCamera = ref<HTMLVideoElement | undefined>()
const remoteActive = ref(false)
const route = useRoute()
const roomId = route.params.roomid
const defaultConstraints = {
    video: {
        width: { min: 640, ideal: window.screen.width * window.devicePixelRatio, max: 1920 },
        height: { min: 480, ideal: window.screen.height * window.devicePixelRatio, max: 1080 },
        facingMode: "user"
    },
    audio: true
}

let channel: RtmChannel
let client: RtmClient

async function agoraDispose() {
    if (channel) await channel.leave()
    if (client) await client.logout()
}

const { stream: localStream, start: getUserMedia } = useUserMedia({ constraints: defaultConstraints })

watchEffect(() => {
    if (localCamera.value) {
        localCamera.value.srcObject = localStream.value!
    }
})

onMounted(async () => {
    getUserMedia()

    client = await useAgora()
    channel = client.createChannel(roomId as string)
    await channel.join()

    channel.on("MemberJoined", (memberId: string) => {
        createAndSendOffer(memberId, localStream.value!)
        remoteCamera.value!.srcObject = remoteStream
    })
    channel.on('MemberLeft', () => {
        remoteActive.value = false
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
        remoteActive.value = true
    })

    window.addEventListener('beforeunload', agoraDispose)
})

onUnmounted(() => {
    window.removeEventListener('beforeunload', agoraDispose)
    agoraDispose()
})



</script>

<template>
    <div class="overflow-hidden h-screen">
        <video class='video' muted="true" ref="localCamera" autoplay playsinline
            :class="{ smallFrame: remoteActive }"></video>
        <video class='video' ref="remoteCamera" autoplay playsinline :class="{ 'hidden': !remoteActive }"></video>

        <ControllerBar :camera-on="true" :voice-on="true" />
    </div>
</template>

<style scoped>
.video {
    position: fixed;
    transform: translateY(0) translateX(0) rotateY(180deg);
    background-color: black;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.5s;

}

.video.smallFrame {
    transform: translateY(20px) translateX(20px) rotateY(180deg);
    height: 170px;
    width: 120px;
    z-index: 999;

}

@media screen and (min-width: 650px) {
    .video.smallFrame {
        width: 300px;
    }
}
</style>