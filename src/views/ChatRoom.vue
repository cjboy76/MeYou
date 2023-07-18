<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { useAgora, useMediaDevices, createAndSendOffer, createAndSendAnswer, remoteStream, appendAnswer, peerConnection } from '../composables'
import { useRoute } from "vue-router";
import type { RtmChannel, RtmClient } from "agora-rtm-sdk";

const localCamera = ref<HTMLVideoElement | undefined>()
const remoteCamera = ref<HTMLVideoElement | undefined>()
const remoteActive = ref(false)
const route = useRoute()
const roomId = route.params.roomid
let channel: RtmChannel
let client: RtmClient

async function agoraDispose() {
    if (channel) await channel.leave()
    if (client) await client.logout()
}

onMounted(async () => {
    localCamera.value!.srcObject = await useMediaDevices()

    client = await useAgora()
    channel = client.createChannel(roomId as string)
    await channel.join()

    channel.on("MemberJoined", (memberId: string) => {
        createAndSendOffer(memberId)
        remoteCamera.value!.srcObject = remoteStream
    })
    channel.on('MemberLeft', () => {
        remoteActive.value = false
    })
    client.on("MessageFromPeer", async (message, memberId) => {
        // @ts-ignore
        const context = JSON.parse(message.text)
        if (context.type === 'offer') {
            createAndSendAnswer(memberId, context)
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
</style>