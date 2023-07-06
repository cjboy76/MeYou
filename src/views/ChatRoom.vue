<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useAgora, useMediaDevices, createAndSendOffer, createAndSendAnswer, remoteStream, appendAnswer, peerConnection } from '../composables'
import { useRoute } from "vue-router";

const localCamera = ref<HTMLVideoElement | undefined>()
const remoteCamera = ref<HTMLVideoElement | undefined>()
const remoteActive = ref(false)
const route = useRoute()
const roomId = route.params.roomid

onMounted(async () => {
    localCamera.value!.srcObject = await useMediaDevices()

    const { agoraClient } = await useAgora()
    const channel = agoraClient.createChannel(roomId as string)
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
        remoteActive.value = true
    })

})

</script>

<template>
    <div class="container">
        <video class='video' muted="true" ref="localCamera" autoplay playsinline
            :class="{ smallFrame: remoteActive }"></video>
        <video class='video' ref="remoteCamera" autoplay playsinline :class="{ hide: !remoteActive }"></video>
    </div>
</template>

<style scoped>
.video {
    background-color: black;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    /* Safari and Chrome */
    -moz-transform: rotateY(180deg);
    /* Firefox */
}

.hide {
    display: none;
}

.smallFrame {
    position: fixed;
    top: 20px;
    left: 20px;
    height: 170px;
    width: 300px;
    border-radius: 5px;
    border: 2px solid #b366f9;
    -webkit-box-shadow: 3px 3px 15px -1px rgba(0, 0, 0, 0.77);
    box-shadow: 3px 3px 15px -1px rgba(0, 0, 0, 0.77);
    z-index: 999;
}

.container {
    height: 100vh;
    overflow: hidden;
}
</style>