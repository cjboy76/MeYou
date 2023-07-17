<script setup lang="ts">
defineEmits<{
    (event: 'create'): void,
    (event: 'share'): void
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
        <button class="cool-link relative" @click="$emit('create')">Create</button>
        <Transition mode="out-in" name="scale">
            <button @click="$emit('share')" v-show="props.roomNumber"
                class="px-2 py-1 bg-slate-200 font-light absolute -bottom-full left-0 right-0 hover:bg-slate-300 focus:outline-none">
                {{ props.roomNumber }}
            </button>
        </Transition>
    </section>
</template>