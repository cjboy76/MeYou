import AgoraRTM, { type RtmClient } from "agora-rtm-sdk"
import { provide, ref } from "vue"

export async function useAgoraClient(uid: string, onError: (error: any) => void) {
    const agoraClient = ref<RtmClient>()

    try {
        agoraClient.value = AgoraRTM.createInstance(import.meta.env.VITE_AGORA_APP_ID)
        agoraClient.value.removeAllListeners()

        await agoraClient.value.login({
            uid
        })

        provide('agoraClient', agoraClient)

        return {
            agoraClient,
            dispose: () => agoraClient.value && agoraClient.value.logout()
        }
    } catch (error) {
        if (onError) onError(error)
    }
}
