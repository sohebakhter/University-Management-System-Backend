import { ResultStatus } from "../../../../generated/prisma/enums";

export interface ICreateResultPayload {
    examId: string;
    registrationId: string;
    marks: number;
    grade?: string;
    gradePoint?: number;
    status?: ResultStatus;
}
export interface IBulkCreateResultPayload {
    examId: string;
    results: {
        registrationId: string;
        marks: number;
        grade?: string;
        gradePoint?: number;
    }[];
}
export interface IUpdateResultPayload {
    marks?: number;
    grade?: string | null;
    gradePoint?: number | null;
    status?: ResultStatus;
}