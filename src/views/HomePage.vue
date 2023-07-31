<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner'
import LandingPage from '@/components/LandingPage.vue';
import { createRoom } from '@/service';
import { useUserStore } from '@/stores/useUserStore';

const router = useRouter()
const userStore = useUserStore()
const isWebview = ref(false)

onBeforeMount(() => {
    isWebview.value = webviewDetect()
})

async function createRoomNumber() {
    const res = await createRoom(userStore.uid)
    if (!res) return undefined
    return res.id
}

function webviewDetect() {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const safari = /safari/.test(userAgent)
    const ios = /iphone|ipod|ipad/.test(userAgent)

    if (ios) {
        return !safari
    } else {
        return userAgent.includes('wv')
    }
}

async function nextHandler() {
    const roomId = await createRoomNumber()
    if (!roomId) {
        toast('Error occurs, please try later.')
        return
    }

    router.replace({ name: 'chatroom', params: { roomid: roomId } })
}

// function shareHandler() {
//     const shareData = {
//         url: `${window.location.origin}/room/${roomNumber.value}`,
//         title: 'MeYou | Video calling with friends.',
//     }
//     if (navigator.share) {
//         navigator.share(shareData);
//     } else {
//         navigator.clipboard.writeText(shareData.url)
//         toast("Copied !!")
//     }
// }
</script>

<template>
    <div class="p-8 md:container relative mx-auto w-full h-full grid place-items-center">
        <template v-if="isWebview">
            Please open in default browser.
        </template>
        <template v-else>
            <LandingPage />
            <button class="fixed-bottom-right cool-link relative font-light disabled:opacity-50" @click="nextHandler">
                Next
            </button>
        </template>
    </div>
</template>