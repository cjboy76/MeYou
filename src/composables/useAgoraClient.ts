import AgoraRTM, { type RtmClient } from "agora-rtm-sdk"
import { provide, ref } from "vue"

export function useAgoraClient(uid: string) {
    const agoraClient = ref<RtmClient>()

    const create = async (onError?: (error: any) => void) => {
        try {
            agoraClient.value = AgoraRTM.createInstance(import.meta.env.VITE_AGORA_APP_ID)
            agoraClient.value.removeAllListeners()

            await agoraClient.value.login({
                uid
            })

            provide('agoraClient', agoraClient)

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
