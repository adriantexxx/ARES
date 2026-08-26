/** Future signed desktop companion contract. The browser never directly controls a USB device. */
export interface DesktopAgentAdapter { getStatus():Promise<{installed:boolean;version?:string}>; requestDeviceSnapshot():Promise<{manufacturer?:string;model?:string;usbMode:'adb'|'recovery'|'download'|'unknown'}> }
