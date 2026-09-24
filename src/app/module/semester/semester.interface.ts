export interface ICreateSemesterPayload {
    name: string;
    year: number;
    registrationStart?: Date;
    registrationEnd?: Date;
    feeAmount: number;
}
export interface IUpdateSemesterPayload {
    name?: string;
    year?: number;
    registrationStart?: Date;
    registrationEnd?: Date;
    feeAmount?: number;
}