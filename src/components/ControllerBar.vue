<script setup lang="ts">
import { GuidanceNoNoise, GuidanceNoVideo, GuidanceVideo, GuidanceVolume, GuidancePhone } from "@/icons";

const props = defineProps({
    cameraOn: Boolean,
    voiceOn: Boolean,
})
</script>

<template>
    <div class=" fixed bottom-[10lvh] left-1/2 -translate-x-1/2 w-full h-auto flex justify-center">
        <button class="mx-2 p-4 rounded-full text-white bg-slate-900 bg-opacity-50">
            <GuidanceVideo v-show="props.cameraOn" class=" w-8 h-8" />
            <GuidanceNoVideo v-show="!props.cameraOn" class="w-8 h-8" />
        </button>
        <button class="mx-2 p-4 rounded-full text-white bg-slate-900 bg-opacity-50">
            <GuidanceVolume v-show="props.voiceOn" class="w-8 h-8" />
            <GuidanceNoNoise v-show="!props.voiceOn" class="w-8 h-8" />
        </button>
        <button class="mx-2 p-4 rounded-full text-white bg-slate-900 bg-opacity-50">
            <GuidancePhone class="w-8 h-8" />
        </button>
    </div>
</template>