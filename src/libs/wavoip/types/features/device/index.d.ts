import { DeviceAllInfo } from './types/device-all-info';
import { DeviceStatus } from './types/device-status';
import { WavoipSocket } from '../../presentation/socket/wavoip';
export declare class Device {
    private readonly wavoip_socket;
    private readonly device_token;
    private id;
    qrcode: string | null;
    device_status: DeviceStatus | "" | null;
    all_info: DeviceAllInfo | null;
    constructor(wavoip_socket: WavoipSocket, device_token: string);
    checkCanCall(): void;
    private getCurrentQRCode;
    private getCurrentDeviceStatus;
    wakeUp(): Promise<import('axios').AxiosResponse<DeviceAllInfo, any>>;
}
