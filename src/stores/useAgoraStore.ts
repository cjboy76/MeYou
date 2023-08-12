import { defineStore } from 'pinia'
import { ref } from 'vue'
import AgoraRTM, { type RtmClient } from "agora-rtm-sdk"

export const useAgoraStore = defineStore('agora', () => {
    const client = ref<RtmClient>()

    const login = async (uid: string, onError?: (error: any) => void) => {
        try {
            const c = AgoraRTM.createInstance(import.meta.env.VITE_AGORA_APP_ID)
            c.removeAllListeners()

            await c.login({
                uid
            })

            client.value = c
        } catch (error) {
            if (onError) onError(error)
        }
    }

    const logout = () => {
        client.value && client.value.logout()
    }

    return {
        client,
        login,
        logout
    }
})
