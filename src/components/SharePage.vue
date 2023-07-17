<script setup lang="ts">
defineEmits<{
    (event: 'create'): void
}>()

const props = defineProps({
    roomNumber: String
})
</script>

<template>
    <section class="text-center relative">
        <h2 class="font-light mb-4">
            Create chatroom, share with it.
        </h2>
        <button class="cool-link" @click="$emit('create')">Create</button>
        <Transition>
            <div v-show="props.roomNumber" class="px-2 py-1 bg-slate-200 font-light absolute -bottom-full left-0 right-0">
                {{ props.roomNumber }}
            </div>
        </Transition>
    </section>
</template>