<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import LandingPage from '@/components/LandingPage.vue';
import SharePage from '@/components/SharePage.vue';

const router = useRouter()

const roomNumber = ref('')
const createPage = ref(false)

const activeComponent = computed(() => {
    return createPage.value ? SharePage : LandingPage
})

function createRoomNumber() {
    roomNumber.value = '1234'
}

function nextHandler() {
    if (createPage.value) {
        const roomid = roomNumber.value
        if (!roomid) return
        router.replace({ name: 'chatroom', params: { roomid } })
        return
    }
    createPage.value = true
}
</script>

<template>
    <div class="md:container relative mx-auto w-full h-full grid place-items-center">
        <Transition name="fade" mode="out-in">
            <component :is="activeComponent" @create="createRoomNumber"></component>
        </Transition>
        <button class="fixed-bottom-right font-light disabled:opacity-50" :class="{ 'cool-link': !createPage }"
            @click="nextHandler" :disabled="createPage && !roomNumber">
            Next
        </button>

    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: transform 0.2s ease-out;
}

.fade-enter-from {
    transform: translateX(100%);
}

.fade-leave-to {
    /* opacity: 0; */
    transform: translateX(-100%);
}
</style>

