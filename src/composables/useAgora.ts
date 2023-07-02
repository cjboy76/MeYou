import { v4 as uuidv4 } from 'uuid';
import AgoraRTM, { type RtmClient } from "agora-rtm-sdk"

export let agoraClient: RtmClient
export let uid: string


export async function useAgora() {
    if (!agoraClient) {
        agoraClient = AgoraRTM.createInstance(import.meta.env.VITE_APP_ID)
        uid = uuidv4()

        await agoraClient.login({
            uid,
        })
    }

    return {
        uid,
        agoraClient,
    }
}
