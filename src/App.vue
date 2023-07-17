<template>
  <Toaster position="top-right" />
  <main class='bg-gray-100 text-gray-700 w-screen h-screen'>
    <RouterView></RouterView>
  </main>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner';
</script>