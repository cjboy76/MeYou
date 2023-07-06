export let localStream: MediaStream

const defaultConstraints = {
    video: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
    },
    audio: true
}

export async function useMediaDevices(constraints: MediaStreamConstraints = defaultConstraints) {
    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
    }
    return localStream
}
