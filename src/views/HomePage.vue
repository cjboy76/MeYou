<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import LandingPage from '@/components/LandingPage.vue';

const router = useRouter()

const formState = ref({
    key: ""
})

function nextHandler(e: MouseEvent) {
    e.preventDefault()
    const roomid = formState.value.key
    if (!roomid) return
    router.replace({ name: 'chatroom', params: { roomid } })
}
</script>

<template>
    <div class="md:container relative mx-auto w-full h-full grid place-items-center">
        <LandingPage />
        <button class="fixed-button font-light cool-link" style="--btn-theme: black" @click="nextHandler">
            Next
        </button>

    </div>
</template>

