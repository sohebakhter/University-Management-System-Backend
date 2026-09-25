import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RegistrationService } from "./registration.service";
import httpStatus from "http-status"

const createRegistration = catchAsync(async (req, res) => {
    const { sectionId } = req.body;
    const user = req.user!
    const result = await RegistrationService.createRegistration(sectionId, user);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Registration created successfully",
        data: result,
    });
});

const getMyRegistrations = catchAsync(async (req, res) => {
    const result =
        await RegistrationService.getMyRegistrations(req.user!);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your registrations retrieved successfully",
        data: result,
    });
});

const getAllRegistrations = catchAsync(async (req, res) => {
    const result =
        await RegistrationService.getAllRegistrations(req.user!);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Registrations retrieved successfully",
        data: result,
    });
});

const getRegistrationById = catchAsync(async (req, res) => {
    const { registrationId } = req.params;

    const result =
        await RegistrationService.getRegistrationById(registrationId as string, req.user!);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Registration retrieved successfully",
        data: result,
    });
});

const dropRegistration = catchAsync(async (req, res) => {
    const { registrationId } = req.params;

    const result =
        await RegistrationService.dropRegistration(registrationId as string, req.user!);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Registration dropped successfully",
        data: result,
    });
});

const updateRegistrationStatus = catchAsync(async (req, res) => {
    const { registrationId } = req.params;
    const { status } = req.body;

    const result = await RegistrationService.updateRegistrationStatus(registrationId as string, status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Registration status updated successfully",
        data: result,
    });
}
);

export const RegistrationController = {
    createRegistration,
    getMyRegistrations,
    getAllRegistrations,
    getRegistrationById,
    dropRegistration,
    updateRegistrationStatus
}