import type { EnvLog } from "./envLog";
import type { IRSensorValue } from "./irSensorValue";

export type Device = {
	id: number;
	macAddress: string;
	ipAddress: string;
	name: string;
	location: string;
	collectMetrics: boolean;
	registeredAt: Date;
	envLog: EnvLog;
	IRSensorValue: IRSensorValue;
	createdAt: Date;
	updatedAt: Date;
};