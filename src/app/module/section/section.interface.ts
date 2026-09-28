export interface ICreateSectionPayload {
    name: string;
    capacity: number;
    courseId: string;
    semesterId: string;
    instructorId: string;
}
export interface IUpdateSectionPayload {
    name?: string;
    capacity?: number;
    courseId?: string;
    semesterId?: string;
    instructorId?: string;
}

export interface ISectionFilterParams {
    semesterId?: string;
    courseId?: string;
    departmentId?: string;
    instructorId?: string;
    searchTerm?: string;
}