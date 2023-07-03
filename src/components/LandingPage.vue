<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useAgora, useMediaDevices, createAndSendOffer, createAndSendAnswer, remoteStream } from '../composables'

const localCamera = ref<HTMLVideoElement | undefined>()
const remoteCamera = ref<HTMLVideoElement | undefined>()

onMounted(async () => {
    const localStream = await useMediaDevices()
    const { agoraClient } = await useAgora()

    const channelId = 'main'
    const channel = agoraClient.createChannel(channelId)
    await channel.join()

    channel.on("MemberJoined", async (memberId: string) => {
        await createAndSendOffer(memberId)
        remoteCamera.value!.srcObject = remoteStream
    })

    agoraClient.on("MessageFromPeer", async (message, memberId) => {
        // @ts-ignore
        const { context } = JSON.parse(message.text)

        if (context.type === 'offer') {
            await createAndSendAnswer(memberId, context.offer)
            remoteCamera.value!.srcObject = remoteStream
        }
    })

    localCamera.value!.srcObject = localStream
})

</script>

<template>
    <div>
        <h1>Welcome to the homepage</h1>
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
</style>