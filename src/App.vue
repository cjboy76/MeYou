<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import { useUserStore } from './stores/useUserStore';
import { computed, onUnmounted } from 'vue';

const userStore = useUserStore()

const isMobile = computed(() => screen.width <= 760)

const toastPosition = computed(() => isMobile.value ? 'top-center' : 'top-right')

onUnmounted(() => {
  userStore.$dispose()
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