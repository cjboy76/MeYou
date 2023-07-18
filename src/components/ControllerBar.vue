<script setup lang="ts">
import { GuidanceNoNoise, GuidanceNoVideo, GuidanceVideo, GuidanceVolume, GuidancePhone } from "@/icons";

defineEmits(['toggleCamera, toggleVoice, close'])
const props = defineProps({
    cameraOn: Boolean,
    voiceOn: Boolean,
})
</script>

<template>
    <div class=" fixed bottom-[10lvh] left-1/2 -translate-x-1/2 w-full h-auto flex justify-center">
        <button class="mx-4 p-4 rounded-full text-white bg-slate-900 bg-opacity-50 hover:bg-opacity-80"
            :class="{ 'bg-red-600': !props.cameraOn }" @click="$emit('toggleCamera')">
            <GuidanceVideo v-show="props.cameraOn" class=" w-8 h-8" />
            <GuidanceNoVideo v-show="!props.cameraOn" class="w-8 h-8" />
        </button>
        <button class="mx-4 p-4 rounded-full text-white bg-slate-900 bg-opacity-50 hover:bg-opacity-80"
            :class="{ 'bg-red-600': !props.voiceOn }" @click="$emit('toggleVoice')">
            <GuidanceVolume v-show="props.voiceOn" class="w-8 h-8" />
            <GuidanceNoNoise v-show="!props.voiceOn" class="w-8 h-8" />
        </button>
        <button class="mx-4 p-4 rounded-full text-white bg-slate-900 bg-opacity-50 hover:bg-opacity-80"
            @click="$emit('close')">
            <GuidancePhone class="w-8 h-8" />
        </button>
    </div>
</template>