<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useAgora, useMediaDevices, createAndSendOffer } from '../composables'

const localCamera = ref<HTMLVideoElement | undefined>()
const remoteCamera = ref<HTMLVideoElement | undefined>()

onMounted(async () => {
    const localStream = await useMediaDevices()
    localCamera.value!.srcObject = localStream


    const { agoraClient } = await useAgora()
    const channelId = 'main'
    const channel = agoraClient.createChannel(channelId)
    await channel.join()


    channel.on("MemberJoined", async (memberId: string) => {
        const { remoteStream } = await createAndSendOffer(memberId)
        remoteCamera.value!.srcObject = remoteStream
    })

    agoraClient.on("MessageFromPeer", (message) => {
        // @ts-ignore
        const offer = JSON.parse(message.text)

        console.log(offer)
    })

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