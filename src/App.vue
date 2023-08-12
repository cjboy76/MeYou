<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import { useUserStore } from './stores/useUserStore';
import { computed, onMounted, onUnmounted } from 'vue';
import { useAgoraClient } from './composables/useAgoraClient';

const userStore = useUserStore()
const { agoraCreate, agoraDispose } = useAgoraClient()

const isMobile = computed(() => screen.width <= 760)

const toastPosition = computed(() => isMobile.value ? 'top-center' : 'top-right')

onMounted(() => {
  agoraCreate(userStore.uid)
})

onUnmounted(() => {
  userStore.$dispose()
  agoraDispose()
})
</script>

<template>
  <Toaster :position="toastPosition" />
  <main class='bg-gray-100 text-gray-700 w-screen h-screen'>
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
</template>