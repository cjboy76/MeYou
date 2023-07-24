<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner'
import LandingPage from '@/components/LandingPage.vue';
import SharePage from '@/components/SharePage.vue';
import { createRoom } from '@/service';

const router = useRouter()

const roomNumber = ref('')
const createPage = ref(false)

const activeComponent = computed(() => {
    return createPage.value ? SharePage : LandingPage
})

async function createRoomNumber() {
    const uid = Math.floor(Math.random() * Date.now()).toString(16)
    const res = await createRoom(uid)
    if (res) {
        roomNumber.value = res?.id
    }
}

function nextHandler() {
    const roomid = roomNumber.value
    // toast.dismiss()
    if (!roomid) return
    router.replace({ name: 'chatroom', params: { roomid } })
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

    </div>
</template>