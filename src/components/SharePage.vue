<script setup lang="ts">
defineEmits<{
    (event: 'create'): void
}>()
</script>

<template>
    <section class="text-center">
        <h2 class="font-light mb-4">
            Create chatroom, share with it.
        </h2>
        <button class="cool-link" @click="$emit('create')">Create</button>
        <div>

        </div>
    </section>
</template>