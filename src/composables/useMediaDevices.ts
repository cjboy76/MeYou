export let localStream: MediaStream

export async function useMediaDevices(constraints: MediaStreamConstraints = { video: true, audio: false }) {
    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
    }
    return localStream
}
