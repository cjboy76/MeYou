import { v4 as uuidv4 } from 'uuid';
import AgoraRTM from "agora-rtm-sdk"

export async function useAgora() {
    const agoraClient = AgoraRTM.createInstance(import.meta.env.VITE_APP_ID)

    const uid = uuidv4()
    const channelId = uuidv4()

    await agoraClient.login({
        uid,
    })

    const channel = agoraClient.createChannel(channelId)
    await channel.join()

    return {
        uid,
        agoraClient,
        channel,
        channelId
    }
}
