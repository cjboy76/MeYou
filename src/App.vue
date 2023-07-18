<script setup lang="ts">
import { Toaster } from 'vue-sonner';
</script>

<template>
  <Toaster position="top-right" />
  <main class='bg-gray-100 text-gray-700 w-screen h-screen'>
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
</template>