export interface ICreateCoursePayload {
    title: string;
    code: string;
    credit: number;
    departmentId: string;
}
export interface IUpdateCoursePayload {
    title?: string;
    code?: string;
    credit?: number;
    departmentId?: string;
}