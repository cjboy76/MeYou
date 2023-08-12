<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import { useUserStore } from './stores/useUserStore';
import { useAgoraStore } from './stores/useAgoraStore';
import { computed, onMounted, onUnmounted } from 'vue';

const userStore = useUserStore()
const agoraStore = useAgoraStore()

const isMobile = computed(() => screen.width <= 760)

const toastPosition = computed(() => isMobile.value ? 'top-center' : 'top-right')

onMounted(() => {
  agoraStore.login(userStore.uid)
})

onUnmounted(() => {
  userStore.$dispose()

  agoraStore.logout()
  agoraStore.$dispose()
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