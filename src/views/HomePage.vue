<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner'
import LandingPage from '@/components/LandingPage.vue';
import SharePage from '@/components/SharePage.vue';
import { createRoom, destroyRoom } from '@/service';
import { useUserStore } from '@/stores/useUserStore';

const router = useRouter()
const userStore = useUserStore()

const roomNumber = ref('')
const createPage = ref(false)

const roomSet = new Set<string>()

const activeComponent = computed(() => {
    return createPage.value ? SharePage : LandingPage
})

const isWebview = ref(false)

onBeforeMount(() => {
    isWebview.value = webviewDetect()
})

onBeforeUnmount(() => {
    roomDispose()
})

async function createRoomNumber() {
    const res = await createRoom(userStore.uid)
    if (!res) return undefined
    roomNumber.value = res?.id
    userStore.isHost = true
    roomSet.add(res.id)
    return res.id
}

function roomDispose() {
    if (roomSet.size <= 1) return
    [...roomSet].forEach(n => {
        if (n !== roomNumber.value) destroyRoom(n)
    })
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

function nextHandler() {
    if (!roomNumber.value) return
    router.replace({ name: 'chatroom', params: { roomid: roomNumber.value }, query: { isHost: String(userStore.isHost) } })
}

function shareHandler() {
    const shareData = {
        url: `${window.location.origin}/room/${roomNumber.value}`,
        title: 'MeYou | Video calling with friends.',
    }
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        navigator.clipboard.writeText(shareData.url)
        toast("Copied !!")
    }
}
</script>

<template>
    <div class="p-8 md:container relative mx-auto w-full h-full grid place-items-center">
        <template v-if="isWebview">
            Please open in default browser.
        </template>
        <template v-else>
            <Transition name="fade" mode="out-in">
                <component :is="activeComponent" :roomNumber="roomNumber" @create="createRoomNumber" @share="shareHandler">
                </component>
            </Transition>
            <button v-show="!createPage" class="fixed-bottom-right cool-link relative font-light disabled:opacity-50"
                @click="createPage = true">
                Next
            </button>
            <button v-show="createPage" class="fixed-bottom-right font-light relative disabled:opacity-50"
                :class="{ 'cool-link': roomNumber }" @click="nextHandler" :disabled="!roomNumber">
                Enter
            </button>
        </template>
    </div>
</template>