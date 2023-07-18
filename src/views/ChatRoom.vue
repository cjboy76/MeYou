<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from "vue"
import { useUserMedia } from '@vueuse/core'
import { useAgora, createAndSendOffer, createAndSendAnswer, remoteStream, appendAnswer, peerConnection } from '../composables'
import { useRoute } from "vue-router";
import { GuidanceNoNoise, GuidanceNoVideo, GuidanceVideo, GuidanceVolume } from "@/icons";
import type { RtmChannel, RtmClient } from "agora-rtm-sdk";

const localCamera = ref<HTMLVideoElement | undefined>()
const remoteCamera = ref<HTMLVideoElement | undefined>()
const remoteActive = ref(false)
const route = useRoute()
const roomId = route.params.roomid
const defaultConstraints = {
    video: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
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

const { stream: localStream, start } = useUserMedia({ constraints: defaultConstraints })

watchEffect(() => {
    if (localCamera.value) {
        localCamera.value.srcObject = localStream.value!
    }
})

onMounted(async () => {
    start()

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
    <div class="custom-container">
        <video class='video' muted="true" ref="localCamera" autoplay playsinline
            :class="{ smallFrame: remoteActive }"></video>
        <video class='video' ref="remoteCamera" autoplay playsinline :class="{ 'hidden': !remoteActive }"></video>

        <div class="controller">
            <GuidanceNoNoise class="icon" />
            <GuidanceNoVideo class="icon" />
            <GuidanceVideo class="icon" />
            <GuidanceVolume class="icon" />
        </div>
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
}

.hide {
    display: none;
}

.smallFrame {
    transform: translateY(20px) translateX(20px) rotateY(180deg);
    height: 170px;
    width: 120px;
    z-index: 999;
    transition: all 0.5s;
}

@media screen and (min-width: 650px) {
    .smallFrame {
        width: 300px;
    }
}

.custom-container {
    height: 100vh;
    overflow: hidden;
}

.controller {
    position: fixed;
    bottom: 10lvh;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: auto;
    background-color: #fff;
    display: flex;
    justify-content: space-around;
}

.controller .icon {
    width: 2rem;
    height: 2rem;
}
</style>