<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useDevicesList, useUserMedia } from '@vueuse/core'

const currentCamera = ref<string>()
const { videoInputs: cameras } = useDevicesList({
    requestPermissions: true,
    onUpdated() {
        if (!cameras.value.find(i => i.deviceId === currentCamera.value))
            currentCamera.value = cameras.value[0]?.deviceId
    },
})

const defaultConstraints = {
    video: {
        width: { min: 640, ideal: window.screen.width * window.devicePixelRatio, max: 1920 },
        height: { min: 480, ideal: window.screen.height * window.devicePixelRatio, max: 1080 },
        deviceId: currentCamera.value,
        facingMode: "user"
    },
    audio: true
}
const video = ref<HTMLVideoElement>()
const { stream, enabled } = useUserMedia({
    constraints: defaultConstraints,
})

watchEffect(() => {
    if (video.value)
        video.value.srcObject = stream.value!
})
</script>

<template>
    <div class="flex flex-col gap-4 text-center">
        <div>
            <button @click="enabled = !enabled">
                {{ enabled ? 'Stop' : 'Start' }}
            </button>
        </div>

        <div>
            <div v-for="camera of cameras" :key="camera.deviceId" class="px-2 py-1 cursor-pointer"
                :class="{ 'text-primary': currentCamera === camera.deviceId }" @click="currentCamera = camera.deviceId">
                {{ camera.label }}
            </div>
        </div>
        <div>
            <video ref="video" muted autoplay playsinline class="h-100 w-auto" />
        </div>
    </div>
</template>