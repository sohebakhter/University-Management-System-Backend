import { AttendanceStatus } from "../../../../generated/prisma/enums";

export interface IMarkAttendancePayload {
    registrationId: string;
    date: Date;
    status: AttendanceStatus;
}
export interface IBulkMarkAttendancePayload {
    sectionId: string;
    date: Date;
    attendances: {
        registrationId: string;
        status: AttendanceStatus;
    }[];
}