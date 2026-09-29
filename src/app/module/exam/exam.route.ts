import { Router } from "express";
import { ExamController } from "./exam.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { CreateExamZodSchema, UpdateExamZodSchema } from "./exam.validation";

const router = Router();

router.post(
    "/",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    validateRequest(CreateExamZodSchema),
    ExamController.createExam
);

router.get(
    "/",
    auth(UserRole.ADMIN, UserRole.STUDENT, UserRole.INSTRUCTOR),
    ExamController.getExams
);

router.get(
    "/:examId",
    auth(UserRole.ADMIN, UserRole.STUDENT, UserRole.INSTRUCTOR),
    ExamController.getExamById
);

router.patch(
    "/:examId",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    validateRequest(UpdateExamZodSchema),
    ExamController.updateExam
);

router.delete(
    "/:examId",
    auth(UserRole.ADMIN),
    ExamController.deleteExam
);

export const ExamRoutes = router;