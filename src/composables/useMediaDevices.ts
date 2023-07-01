export function useMediaDevices(constraints: MediaStreamConstraints = { video: true, audio: false }) {
    return navigator.mediaDevices.getUserMedia(constraints);
}
