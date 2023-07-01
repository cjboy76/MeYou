<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useAgora, useMediaDevices, createOffer } from '../composables'

const localCamera = ref<HTMLVideoElement | undefined>()
const remoteCamera = ref<HTMLVideoElement | undefined>()

onMounted(async () => {
    const { channel } = await useAgora()

    channel.on("MemberJoined", (memberid: string) => {
        console.log({ memberid })
    })

    const localStream = await useMediaDevices()
    localCamera.value!.srcObject = localStream

    const { remoteStream } = await createOffer(localStream)
    remoteCamera.value!.srcObject = remoteStream
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