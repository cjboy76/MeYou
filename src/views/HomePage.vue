<template>
    <div class="container">
        <div>
            <n-form inline :label-width="80" :model="formState">
                <n-form-item>
                    <n-input v-model:value="formState.key" placeholder="聊天室號碼" />
                </n-form-item>
                <n-form-item>
                    <n-button @click="nextHandler">
                        GOGO
                    </n-button>
                </n-form-item>
            </n-form>
        </div>
    </div>
</template>
<script setup lang="ts">
import { NButton, NInput, NForm, NFormItem } from 'naive-ui'
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const formState = ref({
    key: ""
})

function nextHandler(e: MouseEvent) {
    e.preventDefault()
    const roomid = formState.value.key
    if (!roomid) return
    router.push({ name: 'chatroom', params: { roomid } })
}
</script>

<style scoped>
.container {
    height: 100%;
    width: 100%;
    display: grid;
    place-items: center;
}
</style>
