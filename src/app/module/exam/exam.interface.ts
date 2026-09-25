import { ExamType } from "../../../../generated/prisma/enums";

export interface ICreateExamPayload {
    title: string;
    type: ExamType;
    totalMarks: number;
    examDate: string;
    sectionId: string;
}
export interface IUpdateExamPayload {
    title?: string;
    type?: ExamType;
    totalMarks?: number;
    examDate?: string;
}