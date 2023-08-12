import AgoraRTM, { type RtmClient } from "agora-rtm-sdk"
import { ref } from "vue"

export function useAgoraClient() {
    const agoraClient = ref<RtmClient>()

    const create = async (uid: string, onError?: (error: any) => void) => {
        try {
            const c = AgoraRTM.createInstance(import.meta.env.VITE_AGORA_APP_ID)
            c.removeAllListeners()

            await c.login({
                uid
            })

            agoraClient.value = c
        } catch (error) {
            if (onError) onError(error)
        }
    }

    const dispose = () => {
        agoraClient.value && agoraClient.value.logout()
    }

    return {
        agoraClient,
        agoraCreate: create,
        agoraDispose: dispose
    }
}
