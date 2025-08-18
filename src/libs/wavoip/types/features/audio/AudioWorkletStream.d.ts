type Init = AudioContextOptions & {
    workletOptions: object;
};
declare class AudioWorkletStream {
    audio_worklet: AudioWorkletNode | null;
    audio_context: AudioContext | null;
    media_stream_track: Promise<void> | null;
    constructor({ sampleRate, latencyHint, workletOptions }: Init);
    startMediaStreamTrack({ sampleRate, latencyHint, workletOptions, }: Init): Promise<void>;
}
export default AudioWorkletStream;
