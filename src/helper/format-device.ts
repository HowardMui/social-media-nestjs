import { Request } from 'express';
// * The lib only support commonJS style import syntax (Fixed with tsconfig)
import DeviceDetector from 'device-detector-js';

export const formatDevice = (
  req: Request,
): DeviceDetector.DeviceDetectorResult => {
  const userAgent = req.headers['user-agent'];

  const deviceDetector = new DeviceDetector();
  const result = deviceDetector.parse(userAgent);
  return result;
};
