import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SectionService } from "./section.service";
import httpStatus from "http-status"

const createSection = catchAsync(async (req, res) => {
    const result = await SectionService.createSection(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Section created successfully",
        data: result,
    });
});

const getAllSections = catchAsync(async (req, res) => {
    const result = await SectionService.getAllSections();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Sections retrieved successfully",
        data: result,
    });
});

const getSectionById = catchAsync(async (req, res) => {
    const { sectionId } = req.params;

    const result = await SectionService.getSectionById(sectionId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Section retrieved successfully",
        data: result,
    });
});

const updateSection = catchAsync(async (req, res) => {
    const { sectionId } = req.params;
    const payload = req.body
    const result = await SectionService.updateSection(sectionId as string, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Section updated successfully",
        data: result,
    });
});

const deleteSection = catchAsync(async (req, res) => {
    const { sectionId } = req.params;

    const result = await SectionService.deleteSection(sectionId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Section deleted successfully",
        data: result,
    });
});

const getSectionStudents = catchAsync(async (req, res) => {
    const { sectionId } = req.params;
    const user = req.user!
    const result = await SectionService.getSectionStudents(sectionId as string, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Section students retrieved successfully",
        data: result,
    });
});
export const SectionController = {
    createSection,
    getAllSections,
    getSectionById,
    updateSection,
    deleteSection,
    getSectionStudents
}