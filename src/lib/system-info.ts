export type SystemInfo = {
  userAgent: string;
  online: boolean;
  network: NetworkInfo | null;
  audioInputs: AudioDeviceInfo[];
  audioOutputs: AudioDeviceInfo[];
  microphonePermission: "granted" | "denied" | "prompt" | "unknown";
};

export type NetworkInfo = {
  effectiveType: string;
  downlinkMbps: number;
  rttMs: number;
};

export type AudioDeviceInfo = {
  deviceId: string;
  label: string;
  groupId: string;
};

type NavigatorConnection = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
};

export async function collectSystemInfo(): Promise<SystemInfo> {
  const [devices, microphonePermission] = await Promise.all([listAudioDevices(), getMicrophonePermission()]);

  return {
    userAgent: navigator.userAgent,
    online: navigator.onLine,
    network: readNetworkInfo(),
    audioInputs: devices.audioInputs,
    audioOutputs: devices.audioOutputs,
    microphonePermission,
  };
}

async function listAudioDevices(): Promise<{ audioInputs: AudioDeviceInfo[]; audioOutputs: AudioDeviceInfo[] }> {
  if (!navigator.mediaDevices?.enumerateDevices) return { audioInputs: [], audioOutputs: [] };

  const devices = await navigator.mediaDevices.enumerateDevices();
  const project = (d: MediaDeviceInfo): AudioDeviceInfo => ({
    deviceId: d.deviceId,
    label: d.label,
    groupId: d.groupId,
  });

  return {
    audioInputs: devices.filter((d) => d.kind === "audioinput").map(project),
    audioOutputs: devices.filter((d) => d.kind === "audiooutput").map(project),
  };
}

function readNetworkInfo(): NetworkInfo | null {
  const connection = (navigator as Navigator & { connection?: NavigatorConnection }).connection;
  if (!connection) return null;
  return {
    effectiveType: connection.effectiveType ?? "unknown",
    downlinkMbps: connection.downlink ?? 0,
    rttMs: connection.rtt ?? 0,
  };
}

async function getMicrophonePermission(): Promise<SystemInfo["microphonePermission"]> {
  const permissions = (
    navigator as Navigator & { permissions?: { query: (q: { name: string }) => Promise<{ state: string }> } }
  ).permissions;
  if (!permissions?.query) return "unknown";
  try {
    const status = await permissions.query({ name: "microphone" });
    if (status.state === "granted" || status.state === "denied" || status.state === "prompt") return status.state;
    return "unknown";
  } catch {
    return "unknown";
  }
}
