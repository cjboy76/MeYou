import AgoraRTM, { type RtmClient } from "agora-rtm-sdk"

export let agoraClient: RtmClient | undefined
export let uid: string


export async function useAgora() {
    if (agoraClient) return agoraClient

    agoraClient = AgoraRTM.createInstance(import.meta.env.VITE_AGORA_APP_ID)

    return agoraClient
}
