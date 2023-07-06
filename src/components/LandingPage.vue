<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useAgora, useMediaDevices, createAndSendOffer, createAndSendAnswer, remoteStream, appendAnswer, peerConnection } from '../composables'

const localCamera = ref<HTMLVideoElement | undefined>()
const remoteCamera = ref<HTMLVideoElement | undefined>()

onMounted(async () => {
    localCamera.value!.srcObject = await useMediaDevices()

    const { agoraClient } = await useAgora()

    const channelId = 'main'
    const channel = agoraClient.createChannel(channelId)
    await channel.join()

    channel.on("MemberJoined", (memberId: string) => {
        createAndSendOffer(memberId)
        remoteCamera.value!.srcObject = remoteStream
    })

    agoraClient.on("MessageFromPeer", async (message, memberId) => {
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
    })

})

</script>

<template>
    <div class="container">
        <video class='video' ref="localCamera" autoplay playsinline></video>
        <video class='video' ref="remoteCamera" autoplay playsinline></video>
    </div>
</template>

<style>
.video {
    transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    /* Safari and Chrome */
    -moz-transform: rotateY(180deg);
    /* Firefox */
}

.container {
    display: flex;
}
</style>